"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Brand } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { searchBrands } from "@/lib/brands";
import { useI18n } from "@/lib/i18n";

export function SearchBox({ className }: { className?: string }) {
  const router = useRouter();
  const { t, lang, pick } = useI18n();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Brand[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // debounce → hit the search API (includes generated brands), fall back to client
  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
        if (res.ok) {
          const data = (await res.json()) as { results: Brand[] };
          setResults(data.results ?? []);
          return;
        }
      } catch {
        /* fall through */
      }
      setResults(searchBrands(term));
    }, 250);
    return () => clearTimeout(handle);
  }, [q]);

  // close on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const showExplore = q.trim().length > 0;

  return (
    <div ref={boxRef} className={className}>
      <div className="relative">
        <div className="flex items-center gap-2 rounded-2xl border-2 border-white bg-white px-4 py-3 shadow-[0_8px_24px_rgba(43,42,76,0.10)] focus-within:border-bpk-primary">
          <span className="text-xl">🔍</span>
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={t("searchPlaceholder")}
            className="w-full bg-transparent text-base font-semibold text-bpk-ink outline-none placeholder:font-medium placeholder:text-bpk-muted/60"
          />
          {q ? (
            <button
              onClick={() => {
                setQ("");
                setResults([]);
              }}
              className="text-bpk-muted hover:text-bpk-ink cursor-pointer"
            >
              ✕
            </button>
          ) : null}
        </div>

        <AnimatePresence>
          {open && (results.length > 0 || showExplore) ? (
            <motion.div
              initial={{ y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border-2 border-white bg-white shadow-[0_12px_36px_rgba(43,42,76,0.16)]"
            >
              {results.map((b) => (
                <button
                  key={b.slug}
                  onClick={() => {
                    setOpen(false);
                    router.push(`/brand/${b.slug}`);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-bpk-bg2 cursor-pointer"
                >
                  <span className="text-2xl">{b.logo}</span>
                  <span className="flex-1">
                    <span className="block text-sm font-extrabold text-bpk-ink">
                      {pick(b.name, b.nameEn)}
                    </span>
                    <span className="block text-xs font-medium text-bpk-muted">
                      {CATEGORY_LABELS[b.category][lang]}
                    </span>
                  </span>
                  {b.generated ? (
                    <span className="rounded-full bg-bpk-secondary/10 px-2 py-0.5 text-[10px] font-bold text-bpk-secondary">
                      🤖
                    </span>
                  ) : null}
                </button>
              ))}

              {showExplore ? (
                <button
                  onClick={() => {
                    setOpen(false);
                    router.push(`/explore?q=${encodeURIComponent(q.trim())}`);
                  }}
                  className="flex w-full items-center gap-3 border-t-2 border-bpk-bg2 bg-bpk-primary/5 px-4 py-3 text-left transition-colors hover:bg-bpk-primary/10 cursor-pointer"
                >
                  <span className="text-2xl">✨</span>
                  <span className="flex-1 text-sm font-extrabold text-bpk-primary">
                    {t("exploreNew")}：{q.trim()}
                  </span>
                  <span className="text-xs font-bold text-bpk-primary">→</span>
                </button>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
