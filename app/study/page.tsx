"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SiteHeader } from "@/component/SiteHeader";
import { AddReferenceForm } from "@/component/study/AddReferenceForm";
import { ReferenceCard } from "@/component/study/ReferenceCard";
import { Input } from "@/component/ui/Input";
import { SUBJECTS, type SubjectKey } from "@/lib/study/subjects";
import {
  listReferences,
  saveReference,
  updateReference,
  removeReference,
  type StudyReference,
  type StudyReferenceInput,
} from "@/lib/study/storage";

export default function StudyPage() {
  const [refs, setRefs] = useState<StudyReference[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setRefs(listReferences());
    setHydrated(true);
  }, []);

  const handleSaved = (input: StudyReferenceInput) =>
    setRefs(saveReference(input));
  const handleUpdate = (id: string, patch: Partial<StudyReferenceInput>) =>
    setRefs(updateReference(id, patch));
  const handleDelete = (id: string) => {
    if (window.confirm("Delete this reference? This can't be undone.")) {
      setRefs(removeReference(id));
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return refs;
    return refs.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.content.toLowerCase().includes(q),
    );
  }, [refs, query]);

  // group by subject, preserving SUBJECTS order; only subjects with hits appear
  const groups = useMemo(() => {
    const map = new Map<SubjectKey, StudyReference[]>();
    for (const r of filtered) {
      const arr = map.get(r.subject);
      if (arr) arr.push(r);
      else map.set(r.subject, [r]);
    }
    return SUBJECTS.filter((s) => map.has(s.key)).map((s) => ({
      subject: s,
      items: map.get(s.key)!,
    }));
  }, [filtered]);

  const subjectCount = useMemo(
    () => new Set(refs.map((r) => r.subject)).size,
    [refs],
  );

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16">
        {/* hero */}
        <motion.section
          initial={{ y: 16 }}
          animate={{ y: 0 }}
          className="relative mb-6 overflow-hidden rounded-3xl border-2 border-white bg-gradient-to-br from-bpk-secondary via-[#7c6ef0] to-bpk-sky p-6 text-white shadow-[0_12px_36px_rgba(108,92,231,0.35)] sm:p-9"
        >
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-3xl font-extrabold leading-tight drop-shadow-sm sm:text-4xl">
              📚 My Study Shelf
            </h1>
            <p className="mt-2 max-w-xl text-base font-semibold text-white/90 sm:text-lg">
              Save your study references and let AI recognize the subject — then
              everything gets sorted into neat subject files.
            </p>
            {hydrated && refs.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold">
                  📝 {refs.length} reference{refs.length === 1 ? "" : "s"}
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold">
                  🗂️ {subjectCount} subject{subjectCount === 1 ? "" : "s"}
                </span>
              </div>
            )}
          </div>
          <div className="pointer-events-none absolute -right-2 bottom-0 text-[7rem] opacity-20 sm:text-[10rem]">
            📚✏️🧠
          </div>
        </motion.section>

        {/* add form */}
        <AddReferenceForm onSaved={handleSaved} />

        {/* search */}
        {hydrated && refs.length > 0 && (
          <div className="mt-6">
            <Input
              placeholder="🔎 Search your references…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        )}

        {/* board */}
        <section className="mt-6">
          {!hydrated ? (
            <p className="py-10 text-center font-semibold text-bpk-muted">
              Loading your shelf…
            </p>
          ) : refs.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-bpk-line bg-white/50 py-14 text-center">
              <p className="text-5xl">🗂️</p>
              <p className="mt-3 font-extrabold text-bpk-ink">
                Your shelf is empty
              </p>
              <p className="mt-1 text-sm font-semibold text-bpk-muted">
                Add your first reference above and watch it find its subject.
              </p>
            </div>
          ) : groups.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-bpk-line bg-white/50 py-14 text-center">
              <p className="text-5xl">🔍</p>
              <p className="mt-3 font-extrabold text-bpk-ink">
                No references match “{query}”
              </p>
            </div>
          ) : (
            <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
              {groups.map(({ subject, items }) => (
                <div
                  key={subject.key}
                  className="mb-4 break-inside-avoid rounded-3xl border-2 border-white bg-bpk-bg2/60 p-4 shadow-[0_8px_24px_rgba(43,42,76,0.06)]"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="flex items-center gap-2 text-base font-extrabold text-bpk-ink">
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-2xl text-lg"
                        style={{ backgroundColor: subject.color }}
                      >
                        {subject.emoji}
                      </span>
                      {subject.label}
                    </h3>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                      style={{ backgroundColor: subject.color }}
                    >
                      {items.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {items.map((r) => (
                      <ReferenceCard
                        key={r.id}
                        reference={r}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t-2 border-white bg-white/60 py-6 text-center">
        <p className="text-sm font-semibold text-bpk-muted">
          Study Shelf · saved privately in your browser
        </p>
      </footer>
    </>
  );
}
