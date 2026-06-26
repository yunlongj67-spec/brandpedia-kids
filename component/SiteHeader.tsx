"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "./LanguageToggle";

export function SiteHeader() {
  const { t } = useI18n();
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-4 sm:gap-3 sm:py-5">
      <Link href="/" className="flex min-w-0 items-center gap-2">
        <motion.span
          className="shrink-0 text-2xl sm:text-3xl"
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          🧭
        </motion.span>
        <span className="truncate text-lg font-extrabold tracking-tight text-bpk-ink sm:text-2xl">
          Brand<span className="text-bpk-primary">Pedia</span>{" "}
          <span className="rounded-lg bg-bpk-secondary/10 px-1.5 text-sm text-bpk-secondary sm:text-base">
            Kids
          </span>
        </span>
      </Link>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <Link
          href="/survey"
          className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-2 text-sm font-extrabold text-bpk-secondary shadow-[0_4px_12px_rgba(43,42,76,0.08)] transition-transform hover:-translate-y-0.5 sm:px-3"
          title={t("survey")}
        >
          📝 <span className="hidden sm:inline">{t("survey")}</span>
        </Link>
        <Link
          href="/explore"
          className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-2 text-sm font-extrabold text-bpk-primary shadow-[0_4px_12px_rgba(43,42,76,0.08)] transition-transform hover:-translate-y-0.5 sm:px-3"
          title={t("exploreNew")}
        >
          ✨ <span className="hidden sm:inline">{t("exploreNew")}</span>
        </Link>
        <LanguageToggle />
      </div>
    </header>
  );
}
