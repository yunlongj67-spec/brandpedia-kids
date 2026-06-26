"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { BrandContent, Dimension } from "@/lib/types";
import { DIMENSION_LABELS } from "@/lib/types";
import { getBrandBySlug } from "@/lib/brands";
import { usePodcastPlayer } from "@/lib/podcast-utils";
import { useI18n } from "@/lib/i18n";
import { Broadcastplayer } from "./Broadcastplayer";
import { CardFlow } from "./CardFlow";
import { Quiz } from "./quiz";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";

const DIM_ICON: Record<Dimension, string> = {
  "brand-story": "📖",
  "product-thinking": "💡",
  "money-logic": "💰",
  "marketing-magic": "✨",
  competition: "⚔️",
  "fun-data": "📊",
};

export function Branddetail({ content }: { content: BrandContent }) {
  const { brand, script, cards, sections, quiz, related } = content;
  const { t, lang, pick } = useI18n();

  const player = usePodcastPlayer(script, { slug: brand.slug, lang });

  const onNavigateCard = (cardId: string) => {
    const segIdx = script.segments.findIndex((s) => s.cardId === cardId);
    if (segIdx >= 0) player.seek(player.segmentStarts[segIdx] ?? 0);
  };

  const relatedBrands = related
    .map((s) => getBrandBySlug(s))
    .filter((b): b is NonNullable<typeof b> => !!b)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-44 pt-6 sm:pb-36">
      {/* back */}
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-sm font-bold text-bpk-muted hover:text-bpk-ink"
      >
        ← {t("backHome")}
      </Link>

      {/* hero */}
      <motion.div
        initial={{ y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border-2 border-white p-6 shadow-[0_12px_36px_rgba(43,42,76,0.12)] sm:p-8"
        style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}cc)` }}
      >
        <div className="relative z-10 flex flex-col gap-4 text-white sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white/20 text-6xl backdrop-blur">
            {brand.logo}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-extrabold drop-shadow sm:text-4xl">
                {pick(brand.name, brand.nameEn)}
              </h1>
              {brand.featured ? (
                <Badge className="bg-white/25" color="#00000000">
                  ⭐ {t("featuredBadge")}
                </Badge>
              ) : null}
              {brand.generated ? (
                <Badge className="bg-white/25" color="#00000000">
                  🤖 {t("generatedBadge")}
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 text-lg font-bold text-white/90">{pick(brand.slogan, brand.sloganEn)}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
              {brand.founded ? (
                <span className="rounded-full bg-white/20 px-2.5 py-1">📅 {brand.founded}</span>
              ) : null}
              {brand.founder ? (
                <span className="rounded-full bg-white/20 px-2.5 py-1">👤 {pick(brand.founder, brand.founderEn)}</span>
              ) : null}
              {brand.country ? (
                <span className="rounded-full bg-white/20 px-2.5 py-1">📍 {pick(brand.country, brand.countryEn)}</span>
              ) : null}
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-6 -top-8 text-[10rem] opacity-10">
          {brand.logo}
        </div>
      </motion.div>

      {/* podcast + cards */}
      <section className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">🎙️</span>
          <h2 className="text-xl font-extrabold text-bpk-ink">{t("knowledgeTitle")}</h2>
          <span className="text-sm font-semibold text-bpk-muted">
            · {script.host1Name} & {script.host2Name} · {t("podcastHosts")}
          </span>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <div>
            <CardFlow
              cards={cards}
              color={brand.color}
              activeCardId={player.activeCardId}
              onNavigateCard={onNavigateCard}
            />
          </div>

          <div className="rounded-3xl border-2 border-white bg-white/70 p-6 backdrop-blur">
            <p className="text-base font-semibold leading-relaxed text-bpk-ink">
              {pick(brand.description, brand.descriptionEn)}
            </p>
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-bpk-bg2 p-3">
              <div className="flex -space-x-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bpk-primary text-lg ring-2 ring-white">
                  🦊
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bpk-secondary text-lg ring-2 ring-white">
                  🐰
                </span>
              </div>
              <div className="flex-1 text-sm font-semibold text-bpk-muted">
                {pick(script.host1Name, script.host1NameEn)} {lang === "zh" ? "和" : "&"} {pick(script.host2Name, script.host2NameEn)} {lang === "zh" ? "会用聊天的方式给你讲这个品牌的故事～" : "will chat about this brand."}
              </div>
            </div>
            <Button onClick={player.play} variant="primary" size="lg" className="mt-4 w-full">
              ▶ {t("startListening")}
            </Button>
            {!player.ready && !player.audioMode ? (
              <p className="mt-2 text-center text-xs text-bpk-muted">
                {lang === "zh" ? "（使用浏览器语音播放，请打开音量）" : "(uses your browser voice — turn up volume)"}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* knowledge sections */}
      <section className="mt-10">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <h2 className="text-xl font-extrabold text-bpk-ink">{t("knowledgeTitle")}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {sections.map((s) => (
            <motion.div
              key={s.dimension}
              initial={{ y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl border-2 border-white bg-white p-5 shadow-[0_8px_24px_rgba(43,42,76,0.08)]"
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-2xl text-xl"
                  style={{ backgroundColor: `${brand.color}1a` }}
                >
                  {DIM_ICON[s.dimension]}
                </span>
                <h3 className="text-lg font-extrabold" style={{ color: brand.color }}>
                  {pick(s.title, s.titleEn)}
                </h3>
              </div>
              <p className="text-sm font-medium leading-relaxed text-bpk-ink">
                {pick(s.content, s.contentEn)}
              </p>
              {s.keyPoints.length ? (
                <ul className="mt-3 space-y-1">
                  {s.keyPoints.map((kp, i) => (
                    <li key={i} className="flex gap-2 text-xs font-semibold text-bpk-muted">
                      <span style={{ color: brand.color }}>●</span>
                      <span>{pick(kp, s.keyPointsEn[i] ?? "")}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </motion.div>
          ))}
        </div>
      </section>

      {/* quiz */}
      <section className="mt-10">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">🧠</span>
          <h2 className="text-xl font-extrabold text-bpk-ink">{t("quizTitle")}</h2>
        </div>
        <p className="mb-3 text-sm font-semibold text-bpk-muted">{t("quizCta")}</p>
        <Quiz questions={quiz} color={brand.color} />
      </section>

      {/* related */}
      {relatedBrands.length ? (
        <section className="mt-10">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-2xl">🔗</span>
            <h2 className="text-xl font-extrabold text-bpk-ink">{t("relatedTitle")}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {relatedBrands.map((b) => (
              <Link
                key={b.slug}
                href={`/brand/${b.slug}`}
                className="flex flex-col items-center gap-1 rounded-2xl border-2 border-white bg-white p-4 text-center shadow-[0_6px_18px_rgba(43,42,76,0.08)] transition-transform hover:-translate-y-1"
              >
                <span className="text-4xl">{b.logo}</span>
                <span className="text-sm font-extrabold text-bpk-ink">{pick(b.name, b.nameEn)}</span>
                <span className="text-[11px] font-semibold text-bpk-muted">
                  {pick(b.slogan, b.sloganEn)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* mini player */}
      <Broadcastplayer player={player} script={script} brand={brand} />
    </div>
  );
}
