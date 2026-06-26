"use client";

// BrandPedia Kids — podcast playback engine (client side).
//
// Plays a two-host PodcastScript segment by segment. Each segment may carry a
// cardId; while that segment plays the corresponding card is highlighted
// (podcast ↔ card sync).
//
// Audio sources:
//   • Web Speech API (default, zero setup) — two distinct voices for the hosts.
//   • Pre-synthesized audio (when /api/tts returns real audio for a slug) — then
//     we play <audio> elements per segment and support true seek.
//
// Web Speech has no seek/time API, so we model an estimated timeline
// (chars-per-second) to drive the progress bar; seek jumps to the nearest segment.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PodcastScript } from "./types";
import { DEFAULT_LANG, type Lang } from "./i18n";

// chars-per-second at 1x — used only for the progress-bar estimate.
// CJK packs more meaning per char; English is wordier, so it reads more chars/sec.
const CPS: Record<Lang, number> = { zh: 5.2, en: 14 };

export interface PlayerOptions {
  onIndexChange?: (index: number, cardId?: string) => void;
  slug?: string;
  lang?: Lang;
}

export interface PlayerApi {
  playing: boolean;
  activeIndex: number;
  activeCardId?: string;
  currentTime: number;
  duration: number;
  speed: number;
  ready: boolean;
  audioMode: boolean;
  segmentStarts: number[];
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (timeSec: number) => void;
  setSpeed: (s: number) => void;
  stop: () => void;
}

interface AudioMap {
  mode: "web" | "audio";
  segments?: Record<string, string>; // segId -> data/remote URL
}

function pickHostVoices(lang: Lang): [SpeechSynthesisVoice | null, SpeechSynthesisVoice | null] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [null, null];
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return [null, null];
  const want =
    lang === "en"
      ? voices.filter((v) => /^en/i.test(v.lang) || /english/i.test(v.name))
      : voices.filter((v) => /zh|cmn|chinese/i.test(v.lang) || /zh|中|普通话/i.test(v.name));
  const pool = want.length ? want : voices;
  // try to find a female + a male-ish voice for the two hosts
  const female = pool.find((v) => /female|女|xiao|mei|ting|samantha|victoria|zira/i.test(v.name)) ?? pool[0];
  let male = pool.find((v) => /male|男|yun|kang|yang|daniel|alex|david/i.test(v.name));
  if (!male || male === female) male = pool.find((v) => v !== female) ?? pool[0];
  return [female, male];
}

export function usePodcastPlayer(script: PodcastScript, opts: PlayerOptions = {}): PlayerApi {
  const { onIndexChange, slug, lang = DEFAULT_LANG } = opts;
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeedState] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [ready, setReady] = useState(false);
  const [audioMap, setAudioMap] = useState<AudioMap>({ mode: "web" });

  const indexRef = useRef(0);
  const playingRef = useRef(false);
  const speedRef = useRef(1);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timer = useRef(0); // ms elapsed in current segment

  const audioMode = audioMap.mode === "audio" && !!audioMap.segments;

  // estimated durations per segment given current speed & language
  const cps = CPS[lang];
  const durations = useMemo(
    () =>
      script.segments.map((s) => {
        const text = lang === "en" ? (s.textEn ?? s.text) : s.text;
        return Math.max(1.2, text.length / (cps * speed));
      }),
    [script.segments, speed, lang, cps],
  );
  const starts = useMemo(() => {
    const acc: number[] = [];
    let t = 0;
    for (const d of durations) {
      acc.push(t);
      t += d;
    }
    return acc;
  }, [durations]);
  const duration = starts[starts.length - 1] + durations[durations.length - 1];

  // ── load Web Speech voices (async on some browsers) ──
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setReady(true);
      return;
    }
    const load = () => {
      if (window.speechSynthesis.getVoices().length) setReady(true);
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // ── optionally fetch pre-synthesized audio for this slug ──
  useEffect(() => {
    let cancelled = false;
    if (!slug) return;
    fetch(`/api/tts?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: AudioMap | null) => {
        if (!cancelled && data && data.mode === "audio" && data.segments) {
          setAudioMap(data);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const notify = useCallback(
    (i: number) => {
      setActiveIndex(i);
      indexRef.current = i;
      onIndexChange?.(i, script.segments[i]?.cardId);
    },
    [onIndexChange, script.segments],
  );

  const clearTick = () => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  const stopAll = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current = null;
    }
    clearTick();
  }, []);

  // ── play a single segment by index ──
  const playIndex = useCallback(
    (i: number) => {
      if (i >= script.segments.length) {
        setPlaying(false);
        playingRef.current = false;
        setCurrentTime(duration);
        stopAll();
        return;
      }
      notify(i);
      timer.current = 0;
      const seg = script.segments[i];
      const est = durations[i];

      // progress timer (works for both modes)
      clearTick();
      tickRef.current = setInterval(() => {
        timer.current += 100;
        setCurrentTime(starts[i] + Math.min(timer.current / 1000, est));
      }, 100);

      if (audioMode && audioMap.segments?.[seg.id]) {
        if (audioElRef.current) audioElRef.current.pause();
        const el = new Audio(audioMap.segments[seg.id]);
        audioElRef.current = el;
        el.playbackRate = speed;
        el.onended = () => {
          if (!playingRef.current) return;
          playIndex(i + 1);
        };
        el.play().catch(() => {});
      } else if (typeof window !== "undefined" && window.speechSynthesis) {
        const [v1, v2] = pickHostVoices(lang);
        const text = lang === "en" ? (seg.textEn ?? seg.text) : seg.text;
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang === "en" ? "en-US" : "zh-CN";
        u.rate = speed;
        const voice = seg.speaker === "host1" ? v1 : v2;
        if (voice) {
          u.voice = voice;
          u.pitch = seg.speaker === "host1" ? 1.15 : 0.85;
        }
        u.onend = () => {
          if (!playingRef.current) return;
          playIndex(i + 1);
        };
        u.onerror = () => {
          if (playingRef.current) playIndex(i + 1);
        };
        utterRef.current = u;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      } else {
        // no speech support at all — advance on a timer
        setTimeout(() => playingRef.current && playIndex(i + 1), est * 1000);
      }
    },
    [audioMap, audioMode, durations, duration, notify, script.segments, speed, starts, stopAll, lang],
  );

  const play = useCallback(() => {
    if (activeIndex >= script.segments.length) {
      notify(0);
      setCurrentTime(0);
    }
    setPlaying(true);
    playingRef.current = true;
    // if resuming the same index without an active utterance, (re)start it
    if (!utterRef.current && !audioElRef.current) {
      playIndex(indexRef.current);
    } else if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.resume();
      if (audioElRef.current) audioElRef.current.play().catch(() => {});
    }
  }, [activeIndex, script.segments.length, notify, playIndex]);

  const pause = useCallback(() => {
    setPlaying(false);
    playingRef.current = false;
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.pause();
    if (audioElRef.current) audioElRef.current.pause();
    clearTick();
  }, []);

  const toggle = useCallback(() => (playing ? pause() : play()), [playing, pause, play]);

  const seek = useCallback(
    (timeSec: number) => {
      let i = 0;
      for (let k = 0; k < starts.length; k++) {
        if (timeSec >= starts[k]) i = k;
      }
      stopAll();
      utterRef.current = null;
      setCurrentTime(starts[i]);
      notify(i);
      if (playingRef.current) {
        playIndex(i);
      }
    },
    [starts, stopAll, notify, playIndex],
  );

  const setSpeed = useCallback(
    (s: number) => {
      setSpeedState(s);
      speedRef.current = s;
      // restart current segment at new speed so it takes effect immediately
      if (playingRef.current) {
        stopAll();
        utterRef.current = null;
        playIndex(indexRef.current);
      }
    },
    [playIndex, stopAll],
  );

  const stop = useCallback(() => {
    playingRef.current = false;
    setPlaying(false);
    stopAll();
    notify(0);
    setCurrentTime(0);
  }, [notify, stopAll]);

  // cleanup on unmount / script change
  useEffect(() => {
    return () => stopAll();
  }, [stopAll]);

  useEffect(() => {
    stopAll();
    setPlaying(false);
    playingRef.current = false;
    notify(0);
    setCurrentTime(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [script.brandId]);

  const activeCardId = script.segments[activeIndex]?.cardId;

  return {
    playing,
    activeIndex,
    activeCardId,
    currentTime,
    duration,
    speed,
    ready,
    audioMode,
    segmentStarts: starts,
    play,
    pause,
    toggle,
    seek,
    setSpeed,
    stop,
  };
}
