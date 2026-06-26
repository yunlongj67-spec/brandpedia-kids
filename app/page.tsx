"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getAllBrands } from "@/lib/brands";
import type { Category } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { SiteHeader } from "@/component/SiteHeader";
import { SearchBox } from "@/component/SearchBox";
import { CategoryFilter } from "@/component/CategoryFilter";
import { BrandCard } from "@/component/BrandCard";
import { Button } from "@/component/ui/Button";

export default function Home() {
  const { t, lang } = useI18n();
  const [cat, setCat] = useState<Category | "all">("all");

  const brands = useMemo(() => {
    const all = [...getAllBrands()].sort(
      (a, b) => Number(b.featured ?? false) - Number(a.featured ?? false),
    );
    if (cat === "all") return all;
    return all.filter((b) => b.category === cat);
  }, [cat]);

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 xl:max-w-7xl">
        {/* hero */}
        <motion.section
          initial={{ y: 16 }}
          animate={{ y: 0 }}
          className="relative mb-6 overflow-hidden rounded-3xl border-2 border-white bg-gradient-to-br from-bpk-primary via-[#ff9a76] to-bpk-pink p-6 text-white shadow-[0_12px_36px_rgba(255,122,89,0.35)] sm:p-10"
        >
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-3xl font-extrabold leading-tight drop-shadow-sm sm:text-5xl">
              {lang === "zh" ? (
                <>
                  把身边的品牌，
                  <br />
                  变成听得懂的故事 🎧
                </>
              ) : (
                <>
                  Turn everyday brands
                  <br />
                  into stories kids get 🎧
                </>
              )}
            </h1>
            <p className="mt-3 max-w-xl text-base font-semibold text-white/90 sm:text-lg">
              {t("tagline")}
            </p>
            <div className="mt-5 max-w-xl">
              <SearchBox />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Link href="/explore">
                <Button variant="secondary" size="md">
                  ✨ {t("exploreNew")}
                </Button>
              </Link>
              <Link href="/survey">
                <Button variant="soft" size="md">
                  📝 {t("survey")}
                </Button>
              </Link>
              <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold">
                🏢 {getAllBrands().length}+ {t("brandsCount")}
              </span>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-4 bottom-0 text-[8rem] opacity-20 sm:text-[12rem]">
            🧃🎮👟🍎
          </div>
        </motion.section>

        {/* filter */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <CategoryFilter value={cat} onChange={setCat} />
        </div>

        {/* grid */}
        <motion.div
          layout
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        >
          {brands.map((b, i) => (
            <BrandCard key={b.slug} brand={b} index={i} />
          ))}
        </motion.div>

        {brands.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-5xl">🔍</p>
            <p className="mt-3 font-bold text-bpk-muted">
              {lang === "zh" ? "这个分类还没有品牌" : "No brands in this category yet"}
            </p>
          </div>
        ) : null}

        {/* explore banner */}
        <section className="mt-12 overflow-hidden rounded-3xl border-2 border-white bg-white p-6 text-center shadow-[0_10px_30px_rgba(43,42,76,0.10)] sm:p-10">
          <div className="text-5xl">🤖</div>
          <h2 className="mt-3 text-2xl font-extrabold text-bpk-ink sm:text-3xl">
            {lang === "zh" ? "想了解一个新品牌？" : "Curious about a new brand?"}
          </h2>
          <p className="mx-auto mt-2 max-w-xl font-semibold text-bpk-muted">
            {t("exploreDesc")}
          </p>
          <Link href="/explore">
            <Button variant="primary" size="lg" className="mt-5">
              ✨ {t("exploreBtn")}
            </Button>
          </Link>
        </section>
      </main>

      <footer className="border-t-2 border-white bg-white/60 py-6 text-center">
        <p className="text-sm font-semibold text-bpk-muted">{t("footer")}</p>
      </footer>
    </>
  );
}
