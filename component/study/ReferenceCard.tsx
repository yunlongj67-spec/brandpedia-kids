"use client";

import { useState } from "react";
import { Input } from "@/component/ui/Input";
import { Button } from "@/component/ui/Button";
import { SUBJECTS, getSubject, type SubjectKey } from "@/lib/study/subjects";
import type { StudyReference, StudyReferenceInput } from "@/lib/study/storage";

function formatDate(ts: number): string {
  try {
    return new Date(ts).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function ReferenceCard({
  reference,
  onUpdate,
  onDelete,
}: {
  reference: StudyReference;
  onUpdate: (id: string, patch: Partial<StudyReferenceInput>) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(reference.title);
  const [content, setContent] = useState(reference.content);
  const [link, setLink] = useState(reference.link ?? "");
  const [subject, setSubject] = useState<SubjectKey>(reference.subject);

  const meta = getSubject(reference.subject);

  function cancel() {
    setTitle(reference.title);
    setContent(reference.content);
    setLink(reference.link ?? "");
    setSubject(reference.subject);
    setEditing(false);
  }

  function save() {
    onUpdate(reference.id, {
      title: title.trim(),
      content: content.trim(),
      link: link.trim() || undefined,
      subject,
    });
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="rounded-2xl border-2 border-bpk-primary/40 bg-white p-4 shadow-[0_6px_18px_rgba(43,42,76,0.08)]">
        <div className="space-y-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
          <textarea
            className="w-full rounded-2xl border-2 border-bpk-line bg-white px-4 py-3 text-sm text-bpk-ink outline-none focus:border-bpk-primary"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Optional link (https://…)"
            type="url"
          />
          <select
            className="w-full rounded-2xl border-2 border-bpk-line bg-white px-3 py-2 text-sm font-bold text-bpk-ink outline-none focus:border-bpk-primary"
            value={subject}
            onChange={(e) => setSubject(e.target.value as SubjectKey)}
          >
            {SUBJECTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.emoji} {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex gap-2">
          <Button variant="primary" size="sm" onClick={save} disabled={!title.trim()}>
            Save
          </Button>
          <Button variant="soft" size="sm" onClick={cancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group rounded-2xl border-2 border-white bg-white p-4 shadow-[0_6px_18px_rgba(43,42,76,0.06)] transition-shadow hover:shadow-[0_10px_24px_rgba(43,42,76,0.12)]">
      <div className="flex items-center justify-between gap-2">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold text-white"
          style={{ backgroundColor: meta.color }}
        >
          {meta.emoji} {meta.label}
        </span>
        <div className="flex items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg px-2 py-1 text-xs font-bold text-bpk-secondary hover:bg-bpk-secondary/10"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(reference.id)}
            className="rounded-lg px-2 py-1 text-xs font-bold text-bpk-pink hover:bg-bpk-pink/10"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      <h4 className="mt-2 font-extrabold leading-snug text-bpk-ink">
        {reference.title}
      </h4>
      {reference.content && (
        <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-sm font-medium text-bpk-muted">
          {reference.content}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-bpk-muted/70">
          📅 {formatDate(reference.updatedAt)}
        </span>
        {reference.link && (
          <a
            href={reference.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-bpk-sky/15 px-2.5 py-1 text-xs font-bold text-bpk-sky hover:bg-bpk-sky/25"
          >
            🔗 Open
          </a>
        )}
      </div>
    </div>
  );
}
