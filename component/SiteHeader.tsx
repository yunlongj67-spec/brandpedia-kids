"use client";

import Link from "next/link";
import { BookOpen, ClipboardList, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "./LanguageToggle";

export function SiteHeader() {
  const { lang } = useI18n();
  const copy =
    lang === "zh"
      ? { library: "故事库", study: "学习架", survey: "童心问卷", explore: "AI 探索" }
      : { library: "Stories", study: "Study", survey: "Kids’ Survey", explore: "AI Explore" };

  return (
    <header className="sticky top-0 z-40 border-b-2 border-bpk-ink/10 bg-bpk-bg/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group flex min-w-0 items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 border-bpk-ink bg-bpk-sun text-xl shadow-[2px_2px_0_#2b2a4c] transition-transform group-hover:-rotate-6">
            🧭
          </span>
          <span className="truncate text-lg font-black tracking-[-0.035em] text-bpk-ink sm:text-xl">
            Brand<span className="text-bpk-primary">Pedia</span>
            <span className="ml-1 rounded-md bg-bpk-secondary px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-white">
              Kids
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          <Link
            href="/#library"
            className="rounded-xl px-3 py-2 text-sm font-black text-bpk-ink transition-colors hover:bg-white"
          >
            {copy.library}
          </Link>
          <Link
            href="/study"
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-black text-bpk-ink transition-colors hover:bg-white"
          >
            <BookOpen size={16} strokeWidth={2.8} />
            {copy.study}
          </Link>
          <Link
            href="/survey"
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-black text-bpk-ink transition-colors hover:bg-white"
          >
            <ClipboardList size={16} strokeWidth={2.8} />
            {copy.survey}
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/explore"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border-2 border-bpk-ink bg-bpk-primary px-3 text-xs font-black text-white shadow-[2px_2px_0_#2b2a4c] transition-transform hover:-translate-y-0.5 sm:text-sm"
            title={copy.explore}
          >
            <Sparkles size={16} strokeWidth={3} />
            <span className="hidden sm:inline">{copy.explore}</span>
          </Link>
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
