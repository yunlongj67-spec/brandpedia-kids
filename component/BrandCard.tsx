"use client";

import Link from "next/link";
import { ArrowUpRight, Headphones } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { Brand } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

const PAPER_COLORS = ["#ffffff", "#fff8e4", "#f2efff", "#ecfbf5"] as const;

export function BrandCard({ brand, index = 0 }: { brand: Brand; index?: number }) {
  const { lang, pick } = useI18n();
  const reduceMotion = useReducedMotion();
  const cat = CATEGORY_LABELS[brand.category][lang];

  return (
    <motion.article
      layout
      initial={reduceMotion ? false : { y: 18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: Math.min(index * 0.025, 0.35), duration: 0.35 }}
    >
      <Link
        href={`/brand/${brand.slug}`}
        className="group relative flex min-h-64 flex-col overflow-hidden rounded-[1.65rem] border-2 border-bpk-ink p-5 shadow-[4px_4px_0_#2b2a4c] transition-transform hover:-translate-y-1"
        style={{ backgroundColor: PAPER_COLORS[index % PAPER_COLORS.length] }}
        aria-label={`${pick(brand.name, brand.nameEn)} — ${pick(brand.slogan, brand.sloganEn)}`}
      >
        <div
          className="absolute inset-x-0 top-0 h-2"
          style={{ backgroundColor: brand.color }}
          aria-hidden="true"
        />

        <div className="flex items-start justify-between gap-3">
          <span
            className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] border-2 border-bpk-ink text-4xl transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-105"
            style={{ backgroundColor: `${brand.color}18` }}
          >
            {brand.logo}
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-bpk-ink bg-white text-bpk-ink transition-colors group-hover:bg-bpk-sun">
            <ArrowUpRight size={18} strokeWidth={3} />
          </span>
        </div>

        <div className="mt-5">
          <span
            className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white"
            style={{ backgroundColor: brand.color }}
          >
            {cat}
          </span>
          <h3 className="mt-3 text-xl font-black tracking-[-0.025em] text-bpk-ink">
            {pick(brand.name, brand.nameEn)}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-bpk-muted">
            {pick(brand.slogan, brand.sloganEn)}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between border-t-2 border-dashed border-bpk-ink/15 pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-bpk-muted">
            <Headphones size={15} strokeWidth={3} />
            {lang === "zh" ? "听故事" : "Hear the story"}
          </span>
          {brand.featured ? (
            <span className="rounded-full bg-bpk-sun px-2 py-1 text-[10px] font-black uppercase tracking-wider text-bpk-ink">
              {lang === "zh" ? "精选" : "Featured"}
            </span>
          ) : null}
        </div>
      </Link>
    </motion.article>
  );
}
