"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { Brand, Category, Dimension } from "@/lib/types";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/types";
import { getBrandsByCategory } from "@/lib/brands";
import { useI18n } from "@/lib/i18n";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";

const CAT_ICON: Record<Category, string> = {
  "food-beverage": "🍔",
  entertainment: "🎬",
  technology: "💻",
  sports: "⚽",
  retail: "🛒",
  transport: "🚗",
  other: "🎁",
};

const DIM_OPTIONS: { dim: Dimension; key: "storyMoney" | "storyOrigin" | "storyData" }[] = [
  { dim: "brand-story", key: "storyOrigin" },
  { dim: "money-logic", key: "storyMoney" },
  { dim: "fun-data", key: "storyData" },
];

type Step = 1 | 2 | 3 | "result";

export function Survey() {
  const router = useRouter();
  const { t, lang, pick } = useI18n();
  const [step, setStep] = useState<Step>(1);
  const [category, setCategory] = useState<Category | null>(null);
  const [dimension, setDimension] = useState<Dimension | null>(null);
  const [wish, setWish] = useState("");
  const [found, setFound] = useState<Brand | null>(null);
  const [popular, setPopular] = useState<{ wish: string; count: number }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const finish = async (typedWish: string) => {
    setSubmitting(true);
    const w = typedWish.trim();
    setWish(w);

    // look up whether the library already has it (→ accurate intro)
    let foundBrand: Brand | null = null;
    if (w) {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(w)}`);
        if (res.ok) {
          const data = (await res.json()) as { results: Brand[] };
          foundBrand =
            data.results.find(
              (r) => r.name === w || r.nameEn.toLowerCase() === w.toLowerCase(),
            ) ?? (data.results.length ? data.results[0] : null);
          // only treat as "found" on a close name match
          if (foundBrand && foundBrand.name !== w && foundBrand.nameEn.toLowerCase() !== w.toLowerCase()) {
            foundBrand = null;
          }
        }
      } catch {
        /* ignore */
      }
      // record the wish + preferences
      try {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wish: w, category, dimension }),
        });
      } catch {
        /* ignore */
      }
    }
    setFound(foundBrand);

    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = (await res.json()) as { wishes: { wish: string; count: number }[] };
        setPopular(data.wishes ?? []);
      }
    } catch {
      /* ignore */
    }
    setSubmitting(false);
    setStep("result");
  };

  const recommended = category ? getBrandsByCategory(category).slice(0, 6) : [];

  return (
    <div>
      <div className="mb-5 text-center">
        <div className="text-5xl">📝</div>
        <h1 className="mt-2 text-2xl font-extrabold text-bpk-ink sm:text-3xl">{t("surveyTitle")}</h1>
        <p className="mx-auto mt-2 max-w-md font-semibold text-bpk-muted">{t("surveyDesc")}</p>
      </div>

      <div className="rounded-3xl border-2 border-white bg-white p-6 shadow-[0_12px_36px_rgba(43,42,76,0.12)] sm:p-8">
      {/* progress dots */}
      {step !== "result" ? (
        <div className="mb-5 flex items-center justify-center gap-2">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className="h-2.5 rounded-full transition-all"
              style={{
                width: n === step ? 28 : 10,
                backgroundColor: n <= step ? "#6c5ce7" : "#e7dcc9",
              }}
            />
          ))}
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        {/* STEP 1 — category */}
        {step === 1 ? (
          <motion.div key="s1" initial={{ x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-center text-xl font-extrabold text-bpk-ink sm:text-2xl">
              {t("surveyStep1")}
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCategory(c);
                    setStep(2);
                  }}
                  className="flex flex-col items-center gap-1 rounded-2xl border-2 border-bpk-line bg-white p-4 transition-all hover:-translate-y-1 hover:border-bpk-primary cursor-pointer"
                >
                  <span className="text-4xl">{CAT_ICON[c]}</span>
                  <span className="text-sm font-extrabold text-bpk-ink">
                    {CATEGORY_LABELS[c][lang]}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => setStep(2)}
                className="text-sm font-bold text-bpk-muted hover:text-bpk-primary cursor-pointer"
              >
                {t("surveySkip")} →
              </button>
            </div>
          </motion.div>
        ) : null}

        {/* STEP 2 — story type */}
        {step === 2 ? (
          <motion.div key="s2" initial={{ x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-center text-xl font-extrabold text-bpk-ink sm:text-2xl">
              {t("surveyStep2")}
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {DIM_OPTIONS.map((o) => (
                <button
                  key={o.dim}
                  onClick={() => {
                    setDimension(o.dim);
                    setStep(3);
                  }}
                  className="rounded-2xl border-2 border-bpk-line bg-white p-5 text-lg font-extrabold text-bpk-ink transition-all hover:-translate-y-1 hover:border-bpk-primary cursor-pointer"
                >
                  {t(o.key)}
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-between">
              <button onClick={() => setStep(1)} className="text-sm font-bold text-bpk-muted hover:text-bpk-ink cursor-pointer">
                ← {t("surveyBack")}
              </button>
              <button onClick={() => setStep(3)} className="text-sm font-bold text-bpk-muted hover:text-bpk-primary cursor-pointer">
                {t("surveySkip")} →
              </button>
            </div>
          </motion.div>
        ) : null}

        {/* STEP 3 — type a brand */}
        {step === 3 ? (
          <motion.div key="s3" initial={{ x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-center text-xl font-extrabold text-bpk-ink sm:text-2xl">
              {t("surveyStep3")}
            </h2>
            <form
              className="mt-5 flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                finish(wish);
              }}
            >
              <Input
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                placeholder={t("surveyPlaceholder")}
                autoFocus
              />
              <Button type="submit" size="lg" disabled={submitting}>
                {submitting ? "…" : t("surveySubmit")}
              </Button>
            </form>
            <div className="mt-4 flex justify-between">
              <button onClick={() => setStep(2)} className="text-sm font-bold text-bpk-muted hover:text-bpk-ink cursor-pointer">
                ← {t("surveyBack")}
              </button>
              <button
                onClick={() => finish("")}
                className="text-sm font-bold text-bpk-muted hover:text-bpk-primary cursor-pointer"
              >
                {t("surveySkip")} →
              </button>
            </div>
          </motion.div>
        ) : null}

        {/* RESULT */}
        {step === "result" ? (
          <motion.div
            key="result"
            initial={{ y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="text-center">
              <div className="text-4xl">{found ? "🎉" : "🌟"}</div>
              <h2 className="mt-1 text-xl font-extrabold text-bpk-ink">{t("surveyThanks")}</h2>
            </div>

            {/* typed brand outcome */}
            {wish ? (
              found ? (
                <Link
                  href={`/brand/${found.slug}`}
                  className="flex items-center gap-3 rounded-2xl border-2 border-bpk-mint bg-bpk-mint/10 p-4 transition-transform hover:-translate-y-0.5"
                >
                  <span className="text-4xl">{found.logo}</span>
                  <span className="flex-1">
                    <span className="block text-xs font-bold text-bpk-mint">{t("surveyFound")}</span>
                    <span className="block text-lg font-extrabold text-bpk-ink">
                      {pick(found.name, found.nameEn)}
                    </span>
                    <span className="block text-xs font-semibold text-bpk-muted">
                      {pick(found.slogan, found.sloganEn)}
                    </span>
                  </span>
                  <span className="text-bpk-mint">→</span>
                </Link>
              ) : (
                <div className="rounded-2xl border-2 border-bpk-line bg-bpk-bg2 p-4">
                  <p className="font-extrabold text-bpk-ink">
                    {t("surveyNotFound")}：{wish}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-bpk-muted">{t("surveyNotFoundDesc")}</p>
                  <Button onClick={() => router.push(`/explore?q=${encodeURIComponent(wish)}`)} className="mt-3" variant="secondary">
                    {t("surveyMakeIt")}
                  </Button>
                </div>
              )
            ) : null}

            {/* recommendations by category */}
            {recommended.length ? (
              <div>
                <h3 className="mb-2 font-extrabold text-bpk-ink">📚 {t("surveyRecommend")}</h3>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {recommended.map((b) => (
                    <Link
                      key={b.slug}
                      href={`/brand/${b.slug}`}
                      className="flex flex-col items-center gap-1 rounded-xl border-2 border-bpk-line bg-white p-2 transition-transform hover:-translate-y-1"
                    >
                      <span className="text-2xl">{b.logo}</span>
                      <span className="text-center text-[11px] font-bold text-bpk-ink">
                        {pick(b.name, b.nameEn)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            {/* popular wishes */}
            {popular.length ? (
              <div>
                <h3 className="mb-2 font-extrabold text-bpk-ink">👦👧 {t("surveyKidsAlsoWant")}</h3>
                <div className="flex flex-wrap gap-2">
                  {popular.map((p) => (
                    <Link
                      key={p.wish}
                      href={`/explore?q=${encodeURIComponent(p.wish)}`}
                      className="rounded-full border-2 border-bpk-line bg-white px-3 py-1.5 text-sm font-bold text-bpk-ink transition-colors hover:border-bpk-primary"
                    >
                      {p.wish} <span className="text-bpk-muted">×{p.count}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => {
                  setStep(1);
                  setFound(null);
                  setWish("");
                }}
                className="text-sm font-bold text-bpk-primary hover:underline cursor-pointer"
              >
                🔁 {t("surveyRestart")}
              </button>
              <Link href="/" className="text-sm font-bold text-bpk-muted hover:text-bpk-ink">
                ← {t("backHome")}
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      </div>
    </div>
  );
}
