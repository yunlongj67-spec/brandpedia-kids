"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Headphones,
  Lightbulb,
  Search,
  Sparkles,
} from "lucide-react";
import { getAllBrands } from "@/lib/brands";
import type { Category } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { SiteHeader } from "@/component/SiteHeader";
import { SearchBox } from "@/component/SearchBox";
import { CategoryFilter } from "@/component/CategoryFilter";
import { BrandCard } from "@/component/BrandCard";

const HOME_COPY = {
  zh: {
    eyebrow: "给 6–14 岁小探索家的商业百科",
    heroTitleA: "每个品牌背后，",
    heroTitleB: "都藏着一个好问题。",
    heroText:
      "从一双球鞋到一杯可乐，听故事、看卡片、做测验，发现我们每天都在遇见的商业世界。",
    searchHint: "试试搜索：乐高、苹果、可口可乐…",
    featuredCta: "从可口可乐开始",
    exploreCta: "问 AI 一个新品牌",
    issue: "今日大问题",
    question: "一瓶甜甜的饮料，为什么能卖到全世界？",
    answer: "答案不只在配方里，还藏在包装、广告和送货路线里。",
    openStory: "打开这个故事",
    stories: "品牌故事",
    ideas: "商业概念",
    hosts: "迷你主持人",
    trailEyebrow: "你的探索路线",
    trailTitle: "听懂一个品牌，只要三小步",
    trailText: "每个故事都把复杂概念拆成孩子能理解、能复述的小发现。",
    steps: [
      ["先听故事", "两位小主持人边聊边讲，像和朋友一起发现秘密。"],
      ["再看线索", "时间线、数字卡片和小测验帮你抓住重点。"],
      ["最后会思考", "看懂产品、赚钱方式和营销背后的好点子。"],
    ],
    libraryEyebrow: "故事图书馆",
    libraryTitle: "今天想认识谁？",
    libraryText: "按兴趣挑一个品牌，开始你的下一次商业探险。",
    showing: "正在展示",
    allStories: "个故事",
    labEyebrow: "AI 探索实验室",
    labTitle: "这里没有你想找的品牌？",
    labText: "输入任何品牌名，让 AI 把资料整理成一个孩子听得懂的故事。",
    labButton: "制作我的品牌故事",
    surveyButton: "告诉我们你想学什么",
    footer: "把好奇心，变成理解世界的能力。",
    safety: "为孩子设计 · 双语内容 · 无广告",
  },
  en: {
    eyebrow: "The business encyclopedia for curious minds ages 6–14",
    heroTitleA: "Every brand hides",
    heroTitleB: "a really good question.",
    heroText:
      "From sneakers to soda, listen to stories, explore cards and take quick quizzes to uncover the business world hiding in everyday life.",
    searchHint: "Try LEGO, Apple, Coca-Cola…",
    featuredCta: "Start with Coca-Cola",
    exploreCta: "Ask AI about a brand",
    issue: "Today’s big question",
    question: "How did one fizzy drink find its way around the world?",
    answer:
      "The answer is not only in the recipe. It is hiding in the bottle, the ads and the delivery trucks.",
    openStory: "Open this story",
    stories: "brand stories",
    ideas: "big ideas",
    hosts: "mini hosts",
    trailEyebrow: "Your discovery trail",
    trailTitle: "Understand a brand in three small steps",
    trailText:
      "Every adventure turns big business ideas into discoveries kids can understand and retell.",
    steps: [
      ["Hear the story", "Two mini hosts chat through the tale like curious friends."],
      ["Spot the clues", "Timelines, number cards and quizzes help the facts stick."],
      ["Think like a builder", "Uncover the ideas behind products, money and marketing."],
    ],
    libraryEyebrow: "Story library",
    libraryTitle: "Who will you meet today?",
    libraryText: "Pick a brand that sparks your curiosity and start exploring.",
    showing: "Showing",
    allStories: "stories",
    labEyebrow: "AI discovery lab",
    labTitle: "Can’t find the brand in your head?",
    labText:
      "Type any brand name and let AI shape the research into a story made for young minds.",
    labButton: "Make my brand story",
    surveyButton: "Tell us what to build next",
    footer: "Turn everyday curiosity into a way to understand the world.",
    safety: "Made for kids · Bilingual · No ads",
  },
} as const;

const STEP_ICONS = [Headphones, Search, Lightbulb] as const;
const STEP_COLORS = ["#FF6B4A", "#6C5CE7", "#00A878"] as const;

export default function Home() {
  const { lang } = useI18n();
  const [cat, setCat] = useState<Category | "all">("all");
  const copy = HOME_COPY[lang];
  const allBrands = getAllBrands();

  const brands = useMemo(() => {
    const all = [...getAllBrands()].sort(
      (a, b) => Number(b.featured ?? false) - Number(a.featured ?? false),
    );
    if (cat === "all") return all;
    return all.filter((brand) => brand.category === cat);
  }, [cat]);

  const orbitBrands = allBrands.filter((brand) => brand.featured).slice(0, 5);

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 sm:px-6 lg:px-8">
        <section className="bpk-hero-grid relative overflow-hidden rounded-[2rem] border-[3px] border-bpk-ink bg-[#fffbf4] shadow-[8px_8px_0_#2b2a4c]">
          <div className="relative z-10 flex flex-col justify-center px-6 py-10 sm:px-9 sm:py-14 lg:min-h-[620px] lg:px-14">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border-2 border-bpk-ink bg-bpk-sun px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-bpk-ink">
              <Sparkles size={15} strokeWidth={3} />
              {copy.eyebrow}
            </div>

            <h1 className="max-w-3xl text-[2.65rem] font-black leading-[0.98] tracking-[-0.045em] text-bpk-ink sm:text-6xl lg:text-[4.65rem]">
              {copy.heroTitleA}
              <br />
              <span className="bpk-marker">{copy.heroTitleB}</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base font-bold leading-7 text-bpk-muted sm:text-lg">
              {copy.heroText}
            </p>

            <div className="mt-7 max-w-2xl">
              <SearchBox />
              <p className="mt-2 pl-2 text-xs font-bold text-bpk-muted/80">
                {copy.searchHint}
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/brand/coca-cola"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-bpk-ink bg-bpk-primary px-5 py-3 text-sm font-black text-white shadow-[4px_4px_0_#2b2a4c] transition-transform hover:-translate-y-0.5"
              >
                <BookOpen size={18} strokeWidth={3} />
                {copy.featuredCta}
                <ArrowRight size={17} strokeWidth={3} />
              </Link>
              <Link
                href="/explore"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-bpk-ink bg-white px-5 py-3 text-sm font-black text-bpk-ink transition-colors hover:bg-bpk-sun"
              >
                <Sparkles size={18} strokeWidth={3} />
                {copy.exploreCta}
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 border-t-2 border-dashed border-bpk-ink/20 pt-5">
              {[
                [allBrands.length, copy.stories],
                [6, copy.ideas],
                [2, copy.hosts],
              ].map(([value, label]) => (
                <div key={label} className="flex items-baseline gap-1.5">
                  <strong className="text-2xl font-black text-bpk-ink">{value}</strong>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-bpk-muted">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[430px] overflow-hidden border-t-[3px] border-bpk-ink bg-bpk-secondary p-6 lg:min-h-full lg:border-l-[3px] lg:border-t-0 lg:p-9">
            <div className="bpk-orbit-ring bpk-orbit-ring-one" aria-hidden="true" />
            <div className="bpk-orbit-ring bpk-orbit-ring-two" aria-hidden="true" />

            <motion.div
              initial={{ rotate: -2, y: 12 }}
              animate={{ rotate: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 130, damping: 16 }}
              className="relative z-10 mx-auto mt-5 max-w-md rounded-[1.8rem] border-[3px] border-bpk-ink bg-white p-6 shadow-[7px_7px_0_#2b2a4c] sm:p-8 lg:mt-16"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-full bg-bpk-sun px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-bpk-ink">
                  {copy.issue}
                </span>
                <span className="text-4xl" aria-hidden="true">
                  🥤
                </span>
              </div>
              <h2 className="mt-5 text-2xl font-black leading-tight tracking-[-0.025em] text-bpk-ink sm:text-3xl">
                {copy.question}
              </h2>
              <p className="mt-4 text-sm font-bold leading-6 text-bpk-muted">{copy.answer}</p>
              <Link
                href="/brand/coca-cola"
                className="mt-6 inline-flex items-center gap-2 text-sm font-black text-bpk-primary hover:underline"
              >
                {copy.openStory}
                <ArrowRight size={16} strokeWidth={3} />
              </Link>
            </motion.div>

            {orbitBrands.map((brand, index) => {
              const positions = [
                "left-[6%] top-[7%] rotate-[-8deg]",
                "right-[6%] top-[8%] rotate-[7deg]",
                "bottom-[7%] left-[7%] rotate-[6deg]",
                "bottom-[5%] right-[8%] rotate-[-7deg]",
                "bottom-[1%] left-1/2 -translate-x-1/2 rotate-[3deg]",
              ];
              return (
                <Link
                  key={brand.slug}
                  href={`/brand/${brand.slug}`}
                  aria-label={lang === "zh" ? brand.name : brand.nameEn}
                  className={`absolute z-20 flex h-16 w-16 items-center justify-center rounded-[1.25rem] border-[3px] border-bpk-ink bg-white text-3xl shadow-[4px_4px_0_#2b2a4c] transition-transform hover:scale-110 sm:h-[4.5rem] sm:w-[4.5rem] ${positions[index]}`}
                >
                  {brand.logo}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="py-20 sm:py-24">
          <div className="grid gap-9 lg:grid-cols-[0.85fr_1.4fr] lg:items-end">
            <div>
              <p className="bpk-kicker">{copy.trailEyebrow}</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-bpk-ink sm:text-5xl">
                {copy.trailTitle}
              </h2>
              <p className="mt-4 max-w-xl font-bold leading-7 text-bpk-muted">
                {copy.trailText}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {copy.steps.map(([title, text], index) => {
                const Icon = STEP_ICONS[index];
                return (
                  <article
                    key={title}
                    className="relative rounded-[1.5rem] border-2 border-bpk-ink bg-white p-5 shadow-[4px_4px_0_#2b2a4c]"
                  >
                    <span className="absolute right-4 top-3 text-5xl font-black text-bpk-ink/5">
                      0{index + 1}
                    </span>
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-bpk-ink text-white"
                      style={{ backgroundColor: STEP_COLORS[index] }}
                    >
                      <Icon size={22} strokeWidth={3} />
                    </span>
                    <h3 className="mt-5 text-lg font-black text-bpk-ink">{title}</h3>
                    <p className="mt-2 text-sm font-bold leading-6 text-bpk-muted">{text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="library" className="scroll-mt-24 pb-20">
          <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="bpk-kicker">{copy.libraryEyebrow}</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-bpk-ink sm:text-5xl">
                {copy.libraryTitle}
              </h2>
              <p className="mt-3 font-bold text-bpk-muted">{copy.libraryText}</p>
            </div>
            <div className="shrink-0 rounded-full border-2 border-bpk-ink bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-bpk-muted">
              {copy.showing} <span className="text-bpk-primary">{brands.length}</span>{" "}
              {copy.allStories}
            </div>
          </div>

          <CategoryFilter value={cat} onChange={setCat} />

          <motion.div
            layout
            className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {brands.map((brand, index) => (
              <BrandCard key={brand.slug} brand={brand} index={index} />
            ))}
          </motion.div>

          {brands.length === 0 ? (
            <div className="mt-8 rounded-[1.75rem] border-2 border-dashed border-bpk-ink/30 bg-white/60 py-16 text-center">
              <p className="text-5xl">🔍</p>
              <p className="mt-3 font-black text-bpk-muted">
                {lang === "zh" ? "这个分类还没有品牌" : "No brands here yet"}
              </p>
            </div>
          ) : null}
        </section>

        <section className="relative overflow-hidden rounded-[2rem] border-[3px] border-bpk-ink bg-bpk-sun px-6 py-10 shadow-[7px_7px_0_#2b2a4c] sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute -right-4 -top-10 text-[11rem] opacity-10">
            ✦
          </div>
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="bpk-kicker">{copy.labEyebrow}</p>
              <h2 className="mt-2 max-w-3xl text-3xl font-black tracking-[-0.035em] text-bpk-ink sm:text-5xl">
                {copy.labTitle}
              </h2>
              <p className="mt-4 max-w-2xl font-bold leading-7 text-bpk-muted">{copy.labText}</p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/explore"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-bpk-ink bg-bpk-secondary px-5 py-3 text-sm font-black text-white shadow-[4px_4px_0_#2b2a4c] transition-transform hover:-translate-y-0.5"
              >
                <Sparkles size={18} strokeWidth={3} />
                {copy.labButton}
              </Link>
              <Link
                href="/survey"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-bpk-ink bg-white px-5 py-3 text-sm font-black text-bpk-ink hover:bg-[#fff7d6]"
              >
                {copy.surveyButton}
                <ArrowRight size={17} strokeWidth={3} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-20 border-t-[3px] border-bpk-ink bg-bpk-ink px-4 py-8 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="font-black">{copy.footer}</p>
          <p className="text-xs font-extrabold uppercase tracking-wider text-white/60">
            {copy.safety}
          </p>
        </div>
      </footer>
    </>
  );
}
