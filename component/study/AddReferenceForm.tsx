"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { Button } from "@/component/ui/Button";
import { Input } from "@/component/ui/Input";
import { SUBJECTS, getSubject, type SubjectKey } from "@/lib/study/subjects";
import type { StudyReferenceInput } from "@/lib/study/storage";

interface Detected {
  subject: SubjectKey;
  confidence: number;
  method: string;
}

type Status = "idle" | "detecting" | "review";

export function AddReferenceForm({
  onSaved,
}: {
  onSaved: (input: StudyReferenceInput) => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [detected, setDetected] = useState<Detected | null>(null);
  const [chosen, setChosen] = useState<SubjectKey>("other");

  function reset() {
    setTitle("");
    setContent("");
    setLink("");
    setStatus("idle");
    setDetected(null);
    setChosen("other");
  }

  async function detect() {
    if (!title.trim()) return;
    setStatus("detecting");
    try {
      const res = await fetch("/api/study/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      const data = (await res.json()) as Detected;
      setDetected(data);
      setChosen(data.subject);
      setStatus("review");
    } catch {
      setDetected({ subject: "other", confidence: 0, method: "error" });
      setChosen("other");
      setStatus("review");
    }
  }

  function save() {
    onSaved({
      title: title.trim(),
      content: content.trim(),
      link: link.trim() || undefined,
      subject: chosen,
    });
    reset();
  }

  const detectedMeta = detected ? getSubject(detected.subject) : null;

  return (
    <div className="rounded-3xl border-2 border-white bg-white p-5 shadow-[0_10px_30px_rgba(43,42,76,0.08)] sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-extrabold text-bpk-ink">
        ➕ Add a study reference
      </h2>
      <p className="mt-1 text-sm font-semibold text-bpk-muted">
        Paste your notes — AI will recognize the subject for you.
      </p>

      <div className="mt-4 space-y-3">
        <Input
          placeholder="Title (e.g. Quadratic equations)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
        />
        <textarea
          className="w-full rounded-2xl border-2 border-bpk-line bg-white px-4 py-3 text-base text-bpk-ink placeholder:text-bpk-muted/60 outline-none transition-colors focus:border-bpk-primary"
          placeholder="Notes, summary, or key points…"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Input
          placeholder="Optional link (https://…)"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          type="url"
        />
      </div>

      {/* detected-subject review row */}
      {status === "review" && detected && detectedMeta && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-bpk-bg2 px-4 py-3">
          <span className="text-sm font-bold text-bpk-ink">
            {detected.confidence === 0
              ? "Couldn't tell — pick a subject:"
              : "Detected subject:"}
          </span>
          {detected.confidence > 0 && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
              style={{ backgroundColor: detectedMeta.color }}
            >
              {detectedMeta.emoji} {detectedMeta.label} ·{" "}
              {Math.round(detected.confidence * 100)}%
            </span>
          )}
          <select
            className="flex-1 rounded-2xl border-2 border-bpk-line bg-white px-3 py-2 text-sm font-bold text-bpk-ink outline-none focus:border-bpk-primary"
            value={chosen}
            onChange={(e) => setChosen(e.target.value as SubjectKey)}
          >
            {SUBJECTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.emoji} {s.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {status !== "review" ? (
          <Button
            variant="primary"
            onClick={detect}
            disabled={!title.trim() || status === "detecting"}
          >
            {status === "detecting" ? "🔍 Recognizing…" : "🔍 Recognize subject"}
          </Button>
        ) : (
          <>
            <Button variant="primary" onClick={save} disabled={!title.trim()}>
              ✓ Save reference
            </Button>
            <Button variant="soft" onClick={reset}>
              Cancel
            </Button>
          </>
        )}
        {status === "idle" && (
          <Button variant="ghost" onClick={detect} disabled={!title.trim()}>
            ✨ Auto-detect only
          </Button>
        )}
      </div>

      {status === "idle" && (
        <p
          className={clsx(
            "mt-2 text-xs font-semibold text-bpk-muted/80",
          )}
        >
          Tip: works offline with smart keyword matching; add an OpenAI key for
          AI-powered detection.
        </p>
      )}
    </div>
  );
}
