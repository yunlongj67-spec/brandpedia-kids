"use client";

// Lightweight bilingual (zh/en) i18n via React Context.
// No external dep; language persists in localStorage.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "zh" | "en";

type Dict = Record<string, { zh: string; en: string }>;

export const STR: Dict = {
  brandTitle: { zh: "BrandPedia Kids", en: "BrandPedia Kids" },
  tagline: {
    zh: "AI 驱动的儿童商业百科 · 认识世界的年纪，理解商业的逻辑",
    en: "An AI-powered business encyclopedia for kids",
  },
  searchPlaceholder: { zh: "搜索品牌…", en: "Search brands…" },
  allCategories: { zh: "全部", en: "All" },
  exploreNew: { zh: "我要探索新品牌", en: "Explore a new brand" },
  exploreTitle: { zh: "探索新品牌", en: "Explore a New Brand" },
  exploreDesc: {
    zh: "输入任何你好奇的品牌，AI 会为它生成专属的科普故事、播客和卡片。",
    en: "Type any brand you're curious about and AI will make a story, podcast and cards for it.",
  },
  explorePlaceholder: { zh: "比如：泡泡玛特、蜜雪冰城、汪汪队…", en: "e.g. Pop Mart, Mixue, Paw Patrol…" },
  exploreBtn: { zh: "开始探索", en: "Start exploring" },
  generating: { zh: "AI 正在为你准备内容…", en: "AI is preparing content…" },
  startListening: { zh: "开始听播客", en: "Play podcast" },
  podcastHosts: { zh: "两位小主持", en: "Two hosts" },
  knowledgeTitle: { zh: "知识卡片", en: "Knowledge cards" },
  quizTitle: { zh: "知识小测验", en: "Quiz time" },
  quizCta: { zh: "答一答，看看你记住了多少", en: "Answer and see what you remember" },
  relatedTitle: { zh: "相关品牌", en: "Related brands" },
  checkAnswer: { zh: "确认", en: "Check" },
  nextQuestion: { zh: "下一题", en: "Next" },
  correct: { zh: "答对啦！", en: "Correct!" },
  wrong: { zh: "再想想～", en: "Not quite" },
  score: { zh: "你的得分", en: "Your score" },
  restart: { zh: "再玩一次", en: "Play again" },
  backHome: { zh: "返回首页", en: "Back home" },
  flipHint: { zh: "点我翻开", en: "Tap to flip" },
  loading: { zh: "加载中…", en: "Loading…" },
  notFound: { zh: "找不到这个品牌", en: "Brand not found" },
  notFoundDesc: {
    zh: "也许可以试试「探索新品牌」，让 AI 帮你做一个！",
    en: "Try “Explore a new brand” and let AI make one for you!",
  },
  speed: { zh: "倍速", en: "Speed" },
  cardFlowTitle: { zh: "图文卡片", en: "Picture cards" },
  generatingSteps: {
    zh: "收集资料 · 写播客脚本 · 制作卡片 · 即将完成",
    en: "Gathering info · Writing script · Making cards · Almost done",
  },
  generatedBadge: { zh: "AI 生成", en: "AI-made" },
  featuredBadge: { zh: "精选", en: "Featured" },
  brandsCount: { zh: "个品牌", en: "brands" },
  yourProgress: { zh: "进度", en: "Progress" },
  completed: { zh: "生成完成！", en: "Done!" },
  viewBrand: { zh: "去看看", en: "Take me there" },
  footer: {
    zh: "BrandPedia Kids · 让孩子听懂身边的商业世界",
    en: "BrandPedia Kids · Helping kids understand the business world around them",
  },
  survey: { zh: "童心问卷", en: "Kids' Survey" },
  surveyTitle: { zh: "你想了解什么品牌？", en: "What brand do you want to learn?" },
  surveyDesc: {
    zh: "回答几个小问题，我们帮你找到想了解的品牌，还能让 AI 专门为你讲一讲！",
    en: "Answer a few fun questions and we'll help you find a brand — or let AI explain one just for you!",
  },
  surveyStep1: { zh: "你最喜欢哪一类？", en: "Which kind do you like most?" },
  surveyStep2: { zh: "你更想听哪种故事？", en: "What kind of story do you want?" },
  surveyStep3: { zh: "你现在最想了解哪个品牌？", en: "Which brand do you want to learn right now?" },
  surveyNext: { zh: "下一步", en: "Next" },
  surveyBack: { zh: "上一步", en: "Back" },
  surveySkip: { zh: "跳过", en: "Skip" },
  surveySubmit: { zh: "帮我找！", en: "Find it for me!" },
  storyMoney: { zh: "💰 它怎么赚钱", en: "💰 How it makes money" },
  storyOrigin: { zh: "📖 它的故事", en: "📖 Its story" },
  storyData: { zh: "📊 趣味数字", en: "📊 Fun numbers" },
  surveyRecommend: { zh: "为你推荐", en: "For you" },
  surveyFound: { zh: "找到啦！", en: "Found it!" },
  surveyNotFound: { zh: "还没收录这个品牌", en: "We don't have this one yet" },
  surveyNotFoundDesc: {
    zh: "让 AI 专门为你做一份介绍吧～",
    en: "Let AI make an intro just for you~",
  },
  surveyMakeIt: { zh: "✨ 让 AI 帮我做", en: "✨ Let AI make it" },
  surveyKidsAlsoWant: { zh: "其他小朋友也在想了解", en: "Other kids also want to learn" },
  surveyThanks: { zh: "谢谢你的回答！", en: "Thanks for your answers!" },
  surveyPlaceholder: { zh: "输入品牌名，比如：汪汪队、原神…", en: "Type a brand, e.g. Paw Patrol…" },
  surveyRestart: { zh: "再答一次", en: "Start over" },
};

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: keyof typeof STR) => string;
  /** pick a field based on current lang with zh fallback */
  pick: (zh: string | undefined, en: string | undefined) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

// Storage key is versioned so any stale preference from earlier builds is
// ignored and the English default applies cleanly.
const STORAGE_KEY = "bpk-lang2";

/** The site's default language, used for SSR, first paint, and any visitor who
 *  hasn't explicitly toggled. English is the competition default. */
export const DEFAULT_LANG: Lang = "en";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  // After mount, restore an explicit preference if the visitor set one.
  // We intentionally do NOT auto-detect from the browser language — English is
  // the default; visitors switch to Chinese only via the toggle.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "zh" || saved === "en") setLangState(saved);
    } catch {
      /* keep English default */
    }
  }, []);

  // keep <html lang> in sync for accessibility / SEO
  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore (private mode) */
    }
  }, []);

  const toggle = useCallback(
    () => setLang(lang === "zh" ? "en" : "zh"),
    [lang, setLang],
  );

  const t = useCallback(
    (key: keyof typeof STR) => STR[key]?.[lang] ?? String(key),
    [lang],
  );

  const pick = useCallback(
    (zh: string | undefined, en: string | undefined) =>
      lang === "en" ? en || zh || "" : zh || en || "",
    [lang],
  );

  const value = useMemo(
    () => ({ lang, setLang, toggle, t, pick }),
    [lang, setLang, toggle, t, pick],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
