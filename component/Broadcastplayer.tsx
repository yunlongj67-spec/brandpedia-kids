"use client";

import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import type { Brand, PodcastScript } from "@/lib/types";
import type { PlayerApi } from "@/lib/podcast-utils";
import { useI18n } from "@/lib/i18n";

const SPEEDS = [0.8, 1, 1.2];

function fmt(sec: number): string {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function Broadcastplayer({
  player,
  script,
  brand,
}: {
  player: PlayerApi;
  script: PodcastScript;
  brand: Brand;
}) {
  const { t, lang, pick } = useI18n();
  const seg = script.segments[player.activeIndex];
  const host =
    seg?.speaker === "host1"
      ? { name: pick(script.host1Name, script.host1NameEn), emoji: "🦊", color: "#ff7a59" }
      : { name: pick(script.host2Name, script.host2NameEn), emoji: "🐰", color: "#6c5ce7" };

  const cycleSpeed = () => {
    const i = SPEEDS.indexOf(player.speed);
    player.setSpeed(SPEEDS[(i + 1) % SPEEDS.length]);
  };

  return (
    <div className="bpk-safe-bottom fixed inset-x-0 bottom-0 z-40 border-t-2 border-white bg-white/90 backdrop-blur-md shadow-[0_-8px_30px_rgba(43,42,76,0.12)]">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-2 py-2 sm:gap-4 sm:px-6 sm:py-3">
        {/* brand + now speaking */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xl sm:h-11 sm:w-11 sm:text-2xl"
            style={{ backgroundColor: `${brand.color}1a` }}
          >
            {brand.logo}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-extrabold text-bpk-ink">
              {pick(brand.name, brand.nameEn)}
            </div>
            <div className="flex items-center gap-1.5">
              <AnimatePresence mode="wait">
                <motion.span
                  key={host.emoji + seg?.id}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold text-white"
                  style={{ backgroundColor: host.color }}
                >
                  <span>{host.emoji}</span>
                  <span className="hidden sm:inline">{host.name}</span>
                </motion.span>
              </AnimatePresence>
              <span className="truncate text-xs font-medium text-bpk-muted">
                {pick(seg?.text, seg?.textEn) ?? ""}
              </span>
            </div>
          </div>
        </div>

        {/* controls */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => player.seek(Math.max(0, player.currentTime - 10))}
            className="hidden h-9 w-9 items-center justify-center rounded-full bg-bpk-bg2 text-sm font-bold text-bpk-ink hover:bg-bpk-line cursor-pointer sm:flex"
            aria-label="back 10s"
            title="-10s"
          >
            ⏪
          </button>
          <button
            onClick={player.toggle}
            className="flex h-11 w-11 items-center justify-center rounded-full text-white shadow-[0_5px_0_#e8623f] transition-transform hover:translate-y-0.5 active:translate-y-1 cursor-pointer sm:h-12 sm:w-12"
            style={{ backgroundColor: brand.color, boxShadow: `0 5px 0 ${brand.color}bb` }}
            aria-label={player.playing ? "pause" : "play"}
          >
            <span className="text-xl">{player.playing ? "⏸" : "▶"}</span>
          </button>
          <button
            onClick={() => player.seek(Math.min(player.duration, player.currentTime + 10))}
            className="hidden h-9 w-9 items-center justify-center rounded-full bg-bpk-bg2 text-sm font-bold text-bpk-ink hover:bg-bpk-line cursor-pointer sm:flex"
            aria-label="forward 10s"
            title="+10s"
          >
            ⏩
          </button>
        </div>

        {/* seek + speed (desktop) */}
        <div className="hidden min-w-[180px] items-center gap-2 md:flex">
          <span className="w-9 text-right text-[11px] font-bold text-bpk-muted">
            {fmt(player.currentTime)}
          </span>
          <input
            type="range"
            className="bpk-range flex-1"
            min={0}
            max={player.duration || 1}
            step={0.1}
            value={Math.min(player.currentTime, player.duration)}
            onChange={(e) => player.seek(Number(e.target.value))}
          />
          <span className="w-9 text-[11px] font-bold text-bpk-muted">{fmt(player.duration)}</span>
        </div>

        <button
          onClick={cycleSpeed}
          className={clsx(
            "shrink-0 rounded-xl px-2.5 py-1.5 text-xs font-extrabold transition-colors cursor-pointer",
            player.speed !== 1 ? "text-white" : "bg-bpk-bg2 text-bpk-ink hover:bg-bpk-line",
          )}
          style={player.speed !== 1 ? { backgroundColor: brand.color } : undefined}
          title={t("speed")}
        >
          {player.speed}x
        </button>
      </div>

      {/* seek bar (mobile) */}
      <div className="flex items-center gap-2 px-4 pb-2 md:hidden">
        <span className="w-9 text-right text-[10px] font-bold text-bpk-muted">
          {fmt(player.currentTime)}
        </span>
        <input
          type="range"
          className="bpk-range flex-1"
          min={0}
          max={player.duration || 1}
          step={0.1}
          value={Math.min(player.currentTime, player.duration)}
          onChange={(e) => player.seek(Number(e.target.value))}
        />
        <span className="w-9 text-[10px] font-bold text-bpk-muted">{fmt(player.duration)}</span>
      </div>
    </div>
  );
}
