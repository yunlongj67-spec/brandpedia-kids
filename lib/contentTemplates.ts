// BrandPedia Kids — bilingual content generator.
// Turns a Brand's metadata into a full BrandContent bundle in BOTH languages
// (zh + en): 6 knowledge sections + a two-host podcast script + picture cards
// + quiz. Every text field carries a parallel *En sibling so the UI can switch
// languages at runtime without regenerating.
//
// Used for ALL preset brands (featured ones use their hand-authored prose in
// each language) and as the offline fallback for AI "explore new brand".

import type {
  Brand,
  BrandContent,
  Card,
  CardPayload,
  Dimension,
  KnowledgeSection,
  PodcastScript,
  PodcastSegment,
  QuizQuestion,
} from "./types";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  DIMENSIONS,
  DIMENSION_LABELS,
} from "./types";
import { BRANDS, getRelated } from "./brands";

// ───────────────────────── small utilities ─────────────────────────

/** deterministic pseudo-random in [0,1) from a string seed (avoids SSR mismatch) */
function seeded(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

function pick<T>(seed: string, arr: T[]): T {
  return arr[Math.floor(seeded(seed) * arr.length) % arr.length];
}

function shuffle<T>(seed: string, arr: T[]): T[] {
  const a = [...arr];
  let s = seeded(seed) * 100000;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function uniq<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

// CJK + EN sentence splitting
function sentences(text: string): string[] {
  return text
    .split(/(?<=[。！？])/)
    .map((s) => s.trim())
    .filter(Boolean);
}
function sentencesEn(text: string): string[] {
  return text
    .split(/(?<=[.!?])/)
    .map((s) => s.trim())
    .filter(Boolean);
}
function firstSentence(text: string): string {
  return sentences(text)[0] ?? text;
}
function firstSentenceEn(text: string): string {
  return sentencesEn(text)[0] ?? text;
}
function restSentences(text: string): string {
  return sentences(text).slice(1).join("") || text;
}
function restSentencesEn(text: string): string {
  return sentencesEn(text).slice(1).join(" ") || text;
}

/** ensure a CJK fragment reads as a full sentence (ends with 。！？) */
function sent(s: string): string {
  const t = s.trim();
  if (!t) return "";
  return /[。！？]$/.test(t) ? t : t + "。";
}
/** ensure an English fragment reads as a full sentence (ends with .!?) */
function sentEn(s: string): string {
  const t = s.trim();
  if (!t) return "";
  return /[.!?]$/.test(t) ? t : t + ".";
}

/** a keyFact (zh) as a clean sentence, or fallback */
function kf(b: Brand, i: number, fallback = ""): string {
  const f = b.keyFacts && b.keyFacts[i];
  return f ? sent(f) : fallback;
}
/** a keyFact (en) as a clean sentence, or fallback */
function kfEn(b: Brand, i: number, fallback = ""): string {
  const f = b.keyFactsEn && b.keyFactsEn[i];
  return f ? sentEn(f) : fallback;
}

const founderEn = (b: Brand) => b.founderEn ?? b.founder ?? "its founders";
const founderZh = (b: Brand) => b.founder ?? "一群有想法的人";
const countryEn = (b: Brand) => b.countryEn ?? b.country ?? "the world";
const countryZh = (b: Brand) => b.country ?? "远方";

/** does string a share a 2+ char token with b? (used to avoid ambiguous distractors) */
function sharesToken(a: string, b: string): boolean {
  const split = (s: string) =>
    s
      .split(/[\/·、,，；;：（()）\s]+/)
      .map((x) => x.trim())
      .filter((x) => x.length >= 2);
  const ta = new Set(split(a));
  return split(b).some((t) => ta.has(t));
}

interface Pair {
  zh: string;
  en: string;
}

/** pick N distinct distractors (as zh/en pairs), excluding the truth & token-overlaps */
function distractorsPaired(
  seed: string,
  pool: Pair[],
  truth: Pair,
  n: number,
  avoidTokensOf?: string,
): Pair[] {
  const seen = new Set<string>([truth.zh, truth.en]);
  const out: Pair[] = [];
  for (const c of shuffle(seed, pool)) {
    if (!c.zh || !c.en) continue;
    if (seen.has(c.zh) || seen.has(c.en)) continue;
    if (avoidTokensOf && sharesToken(c.zh, avoidTokensOf)) continue;
    seen.add(c.zh);
    seen.add(c.en);
    out.push(c);
    if (out.length >= n) break;
  }
  return out;
}

// ───────────────────────── dimension composition ─────────────────────────

const RICH_FIELD: Record<Dimension, keyof Brand> = {
  "brand-story": "story",
  "product-thinking": "product",
  "money-logic": "money",
  "marketing-magic": "marketing",
  competition: "competition",
  "fun-data": "funData",
};

/** Chinese phrasings — each dimension pinned to a distinct keyFact index so the
 *  same fact isn't repeated across sections of one brand. */
const TEMPLATES: Record<Dimension, ((b: Brand) => string)[]> = {
  "brand-story": [
    (b) =>
      `${sent(kf(b, 0, `${b.name}诞生于${b.founded ?? "很多年前"}`))}它来自${
        countryZh(b)
      }，由${founderZh(b)}一步步做了起来。`,
    (b) =>
      `${founderZh(b)}在${b.founded ?? ""}年把${b.name}带到了${
        countryZh(b)
      }。${kf(b, 0, "")}`,
    (b) =>
      `每个大品牌都从一个想法开始，${b.name}也是。${kf(b, 0, `它在${b.founded ?? ""}年的${countryZh(b)}诞生`)}${
        b.founder ? `创办人是${b.founder}。` : ""
      }`,
  ],
  "product-thinking": [
    (b) =>
      `${b.name}卖的不只是东西，更是一种让你喜欢的感觉。${kf(b, 1, "它把产品做得简单又好看")}它先把"你需要什么"想清楚，再做成又好用又好看的样子。`,
    (b) =>
      `为什么很多人喜欢${b.name}？因为它的产品懂你。${kf(b, 1, "它在细节上花了很多心思")}好的产品，是把你没说出口的需要变成了手里的东西。`,
    (b) =>
      `${b.name}的产品有个共同点：简单、好看、好用。${kf(b, 1, "你用起来就会觉得顺手")}它花了很多心思在细节上。`,
  ],
  "money-logic": [
    (b) =>
      `${b.name}怎么赚钱？简单说，就是把东西卖给很多人，每个人付一点，加起来就很多。${kf(
        b,
        2,
        "它靠卖产品给很多顾客赚钱",
      )}它还会想办法把成本压低，这样卖得便宜也能赚到钱。`,
    (b) =>
      `想懂${b.name}怎么赚钱，要看它的钱从哪来、花到哪去。${kf(b, 2, "它主要靠卖产品给很多顾客赚钱")}它把成本控制得好，所以利润就留得住。`,
    (b) =>
      `${b.name}的生意经其实是"薄利多销"——单件赚不多，但卖给成千上万的人，数字就很惊人。${kf(
        b,
        2,
        "它也靠品牌和服务卖出更好的价钱",
      )}`,
  ],
  "marketing-magic": [
    (b) =>
      `${b.name}很会"让人记住自己"。它用好听的口号、好看的广告，还有和明星、动画的合作，让你一看到就想起它。${
        b.slogan ? sent(`它的口号是"${b.slogan}"`) : ""
      }`,
    (b) =>
      `营销就像变魔术，悄悄让你喜欢上${b.name}。${
        b.slogan ? sent(`记住"${b.slogan}"这句话，就记住了它的感觉`) : "它让你一看到就想起它"
      }`,
    (b) =>
      `${b.name}的广告常常不讲产品，而讲一种心情——快乐、酷、或者陪伴。${
        b.slogan ? sent(`"${b.slogan}"就是最好的例子`) : "这就是它让你记住它的办法"
      }`,
  ],
  competition: [
    (b) =>
      `${b.name}也有对手哦。同一个行业里，总有好几家公司比赛。${kf(
        b,
        3,
        "看谁的产品更好、价格更香、广告更酷",
      )}比赛让它们都变得更强，你才能买到越来越好的东西。`,
    (b) =>
      `商场上没有永远的冠军，${b.name}要一直面对对手的挑战。${kf(b, 3, "谁更懂顾客，谁就能赢")}`,
    (b) =>
      `${b.name}的身边从不缺少竞争者。${kf(b, 3, "它们你追我赶，最后受益的是我们这些买东西的人")}`,
  ],
  "fun-data": [
    (b) =>
      `${b.name}有一些超有趣的数字！${sent(b.funFact ?? kf(b, 0, "它藏着不少冷知识"))}这些数字会让你一下就记住它。`,
    (b) =>
      `用数字看${b.name}，会更有意思。${sent(b.funFact ?? kf(b, 0, "它的故事里藏着不少让人惊讶的数字"))}记住这些，你就是${b.name}小专家啦。`,
    (b) =>
      `考考你的记忆力：${sent(b.funFact ?? kf(b, 0, ""))}是不是没想到？${b.name}还有更多好玩的冷知识等着你。`,
  ],
};

/** English phrasings, parallel to TEMPLATES. */
const EN_TEMPLATES: Record<Dimension, ((b: Brand) => string)[]> = {
  "brand-story": [
    (b) =>
      `${b.nameEn} began in ${countryEn(b)}${
        b.founded ? ` in ${b.founded}` : " long ago"
      }, started by ${founderEn(b)}. ${kfEn(b, 0, `It grew step by step into the brand kids know today.`)}`,
    (b) =>
      `${founderEn(b)} brought ${b.nameEn} to ${countryEn(b)}${
        b.founded ? ` in ${b.founded}` : ""
      }. ${kfEn(b, 0, "")}`,
    (b) =>
      `Every big brand starts with an idea, and so did ${b.nameEn}. ${kfEn(
        b,
        0,
        `It was born in ${countryEn(b)}${b.founded ? ` in ${b.founded}` : ""}.`,
      )}${b.founderEn || b.founder ? ` It was founded by ${founderEn(b)}.` : ""}`,
  ],
  "product-thinking": [
    (b) =>
      `${b.nameEn} doesn't just sell things — it sells a feeling you love. ${kfEn(
        b,
        1,
        "It makes its products simple and beautiful.",
      )} It figures out what you need, then makes it easy and fun to use.`,
    (b) =>
      `Why do so many people love ${b.nameEn}? Because its products get you. ${kfEn(
        b,
        1,
        "It pays a lot of attention to the little details.",
      )} A great product turns the need you never said out loud into something in your hand.`,
    (b) =>
      `${b.nameEn}'s products share one thing: simple, good-looking, easy to use. ${kfEn(
        b,
        1,
        "They just feel right when you use them.",
      )} It puts a lot of care into the details.`,
  ],
  "money-logic": [
    (b) =>
      `How does ${b.nameEn} make money? Simply put: sell to lots of people, each pays a little, and it adds up. ${kfEn(
        b,
        2,
        "It earns by selling products to many customers.",
      )} It also keeps costs low, so it can sell cheaply and still profit.`,
    (b) =>
      `To understand how ${b.nameEn} makes money, look at where the money comes from and where it goes. ${kfEn(
        b,
        2,
        "It mainly earns by selling products to many customers.",
      )} It controls costs well, so the profit stays.`,
    (b) =>
      `${b.nameEn}'s secret is "small margin, huge volume" — it earns little per item, but sells to millions, so the total is huge. ${kfEn(
        b,
        2,
        "It also charges more thanks to its brand and service.",
      )}`,
  ],
  "marketing-magic": [
    (b) =>
      `${b.nameEn} is great at making you remember it. With catchy slogans, great ads, and tie-ups with stars and cartoons, you think of it the moment you see it.${
        b.sloganEn ? ` ${sentEn(`Its slogan is "${b.sloganEn}"`)}` : ""
      }`,
    (b) =>
      `Marketing is like magic that quietly makes you like ${b.nameEn}. ${
        b.sloganEn
          ? sentEn(`Remember "${b.sloganEn}" and you remember how it feels`)
          : "It makes you think of it the moment you see it"
      }.`,
    (b) =>
      `${b.nameEn}'s ads often skip the product and sell a feeling — happiness, coolness, or togetherness. ${
        b.sloganEn ? sentEn(`"${b.sloganEn}" is the perfect example`) : "That's how it sticks in your mind"
      }.`,
  ],
  competition: [
    (b) =>
      `${b.nameEn} has rivals too. In the same industry, several companies always compete. ${kfEn(
        b,
        3,
        "Whoever has better products, better prices, or cooler ads wins.",
      )} Competition makes them all stronger, so you get better and better things.`,
    (b) =>
      `There's no forever champion in business, and ${b.nameEn} always faces challengers. ${kfEn(
        b,
        3,
        "Whoever understands customers best wins.",
      )}`,
    (b) =>
      `${b.nameEn} is never short of competitors. ${kfEn(
        b,
        3,
        "They chase each other, and in the end we shoppers benefit.",
      )}`,
  ],
  "fun-data": [
    (b) =>
      `${b.nameEn} has some super-fun numbers! ${sentEn(b.funFactEn ?? kfEn(b, 0, "It hides quite a few cool facts"))} These numbers will make it stick in your mind.`,
    (b) =>
      `Seeing ${b.nameEn} through numbers is even more fun. ${sentEn(
        b.funFactEn ?? kfEn(b, 0, "Its story hides some surprising numbers"),
      )} Remember these and you're a ${b.nameEn} expert.`,
    (b) =>
      `Test your memory: ${sentEn(b.funFactEn ?? kfEn(b, 0, ""))} Surprised? ${b.nameEn} has plenty more fun facts waiting for you.`,
  ],
};

function composeSection(brand: Brand, dim: Dimension): KnowledgeSection {
  const richKey = RICH_FIELD[dim] as keyof Brand;
  const rich = brand[richKey] as string | undefined;
  const richEn = brand[(richKey + "En") as keyof Brand] as string | undefined;
  const variants = TEMPLATES[dim];
  const enVariants = EN_TEMPLATES[dim];
  const vi = Math.floor(seeded(brand.id + dim) * variants.length) % variants.length;
  const content = rich && rich.trim() ? rich : variants[vi](brand);
  const contentEn = richEn && richEn.trim() ? richEn : enVariants[vi](brand);
  const labels = DIMENSION_LABELS[dim];

  // key points (zh): 2-3 short points from content; fun-data prefers keyFacts
  let keyPoints: string[];
  if (dim === "fun-data" && brand.keyFacts && brand.keyFacts.length) {
    keyPoints = brand.keyFacts.slice(0, 3);
  } else {
    const ss = sentences(content);
    keyPoints = ss.slice(0, 3).map((s) => (s.length > 42 ? s.slice(0, 40) + "…" : s));
    if (keyPoints.length === 0 && brand.keyFacts) keyPoints = brand.keyFacts.slice(0, 3);
  }

  // key points (en): from the English content; fun-data prefers keyFactsEn
  let keyPointsEn: string[];
  if (dim === "fun-data" && brand.keyFactsEn && brand.keyFactsEn.length) {
    keyPointsEn = brand.keyFactsEn.slice(0, 3);
  } else {
    const ss = sentencesEn(contentEn);
    keyPointsEn = ss.slice(0, 3).map((s) => (s.length > 90 ? s.slice(0, 87) + "…" : s));
    if (keyPointsEn.length === 0 && brand.keyFactsEn) keyPointsEn = brand.keyFactsEn.slice(0, 3);
  }

  return {
    dimension: dim,
    title: labels.zh,
    titleEn: labels.en,
    content,
    contentEn,
    keyPoints,
    keyPointsEn,
    funFact: dim === "fun-data" ? brand.funFact : undefined,
    funFactEn: dim === "fun-data" ? brand.funFactEn : undefined,
  };
}

// ───────────────────────── cards ─────────────────────────

interface DP {
  label: string;
  labelEn?: string;
  value: number;
  unit?: string;
  unitEn?: string;
}

function ensureDataPoints(brand: Brand): DP[] {
  if (brand.dataPoints && brand.dataPoints.length) return brand.dataPoints;
  const age = brand.founded ? new Date().getFullYear() - brand.founded : 10;
  return [
    { label: "品牌年龄", labelEn: "Brand age", value: age, unit: "岁", unitEn: "yrs" },
    { label: "成立年份", labelEn: "Founded", value: brand.founded ?? 2000, unit: "年", unitEn: "" },
  ];
}

function ensureTimeline(brand: Brand) {
  if (brand.timeline && brand.timeline.length) return brand.timeline;
  return [
    {
      year: String(brand.founded ?? "—"),
      title: "品牌诞生",
      titleEn: "Brand born",
      desc: `${brand.name}在${countryZh(brand)}创立`,
      descEn: `${brand.nameEn} was founded in ${countryEn(brand)}.`,
    },
    {
      year: "今天",
      title: "家喻户晓",
      titleEn: "A household name",
      desc: brand.keyFacts?.[0] ?? `${brand.name}被很多人知道和喜欢`,
      descEn: brand.keyFactsEn?.[0] ?? `${brand.nameEn} is known and loved by many.`,
    },
  ];
}

function buildCards(brand: Brand): Card[] {
  const cards: Card[] = [];

  cards.push({
    id: "c-intro",
    type: "image-text",
    title: brand.name,
    titleEn: brand.nameEn,
    payload: {
      kind: "image-text",
      emoji: brand.logo,
      text: brand.description,
      textEn: brand.descriptionEn,
    } as CardPayload,
  });

  cards.push({
    id: "c-story",
    type: "image-text",
    title: "它是怎么来的",
    titleEn: "How it began",
    payload: {
      kind: "image-text",
      emoji: "📖",
      text: brand.funFact ?? brand.description,
      textEn: brand.funFactEn ?? brand.descriptionEn,
    } as CardPayload,
  });

  const dp = ensureDataPoints(brand);
  cards.push({
    id: "c-chart",
    type: "chart",
    title: "趣味数据",
    titleEn: "Fun numbers",
    payload: {
      kind: "chart",
      chartType: "bar",
      unit: dp[0]?.unit,
      unitEn: dp[0]?.unitEn,
      labels: dp.map((d) => d.label),
      labelsEn: dp.map((d) => d.labelEn ?? d.label),
      values: dp.map((d) => d.value),
      caption: `看看${brand.name}的几个有趣数字`,
      captionEn: `Some fun numbers about ${brand.nameEn}`,
    } as CardPayload,
  });

  cards.push({
    id: "c-timeline",
    type: "timeline",
    title: "品牌时间线",
    titleEn: "Timeline",
    payload: {
      kind: "timeline",
      events: ensureTimeline(brand).map((e) => ({
        year: e.year,
        title: e.title,
        titleEn: e.titleEn ?? e.title,
        desc: e.desc,
        descEn: e.descEn ?? e.desc,
      })),
    } as CardPayload,
  });

  return cards;
}

// ───────────────────────── quiz ─────────────────────────

type TypeKey =
  | "funfact"
  | "founder"
  | "year"
  | "country"
  | "category"
  | "slogan"
  | "number"
  | "extra";

interface RawQuestion {
  id: string;
  question: string;
  questionEn: string;
  options: string[];
  optionsEn: string[];
  correct: number;
  explanation: string;
  explanationEn: string;
  dimension: QuizQuestion["dimension"];
}

/** build one question of a given type, or null if the brand lacks the data */
function buildQuestion(brand: Brand, type: TypeKey): RawQuestion | null {
  const others = BRANDS.filter((b) => b.slug !== brand.slug);
  const id = `q-${type}`;
  const s = (k: string) => brand.id + k;

  const finalize = (
    phZh: string[],
    phEn: string[],
    truth: Pair,
    pool: Pair[],
    seedD: string,
    seedO: string,
    seedP: string,
    explainZh: string,
    explainEn: string,
    dimension: QuizQuestion["dimension"],
    avoidTruth = false,
  ): RawQuestion | null => {
    const opts = distractorsPaired(seedD, pool, truth, 3, avoidTruth ? truth.zh : undefined);
    if (opts.length < 3) return null;
    const all = shuffle(seedO, [truth, ...opts]).slice(0, 4);
    return {
      id,
      question: pick(seedP, phZh),
      questionEn: pick(seedP, phEn),
      options: all.map((p) => p.zh),
      optionsEn: all.map((p) => p.en),
      correct: all.findIndex((p) => p.zh === truth.zh && p.en === truth.en),
      explanation: explainZh,
      explanationEn: explainEn,
      dimension,
    };
  };

  switch (type) {
    case "funfact": {
      if (!brand.funFact) return null;
      const truth: Pair = { zh: brand.funFact, en: brand.funFactEn ?? brand.funFact };
      const pool = others
        .map((b) => ({ zh: b.funFact ?? "", en: b.funFactEn ?? b.funFact ?? "" }))
        .filter((p) => p.zh && p.en);
      return finalize(
        [
          `关于${brand.name}，下面哪个说法是对的？`,
          `下面哪句话说的才是${brand.name}？`,
          `关于${brand.name}，哪一个是真的？`,
        ],
        [
          `Which statement about ${brand.nameEn} is true?`,
          `Which of these is really about ${brand.nameEn}?`,
          `Which one is true about ${brand.nameEn}?`,
        ],
        truth,
        pool,
        s("ff"),
        s("ffo"),
        s("ffp"),
        brand.funFact,
        brand.funFactEn ?? brand.funFact,
        "fun-data",
      );
    }
    case "founder": {
      if (!brand.founder) return null;
      const truth: Pair = { zh: brand.founder, en: brand.founderEn ?? brand.founder };
      const pool = others
        .filter((b) => b.founder)
        .map((b) => ({ zh: b.founder!, en: b.founderEn ?? b.founder! }));
      return finalize(
        [`${brand.name}是谁创办的？`, `${brand.name}的创始人是哪一位？`, `把${brand.name}做出来的人是谁？`],
        [`Who founded ${brand.nameEn}?`, `Who is the founder of ${brand.nameEn}?`, `Who created ${brand.nameEn}?`],
        truth,
        pool,
        s("fd"),
        s("fdo"),
        s("fdp"),
        `${brand.name}由${brand.founder}创办。`,
        `${brand.nameEn} was founded by ${truth.en}.`,
        "brand-story",
        true,
      );
    }
    case "year": {
      if (!brand.founded) return null;
      const truth: Pair = { zh: String(brand.founded), en: String(brand.founded) };
      const pool = uniq(others.map((b) => b.founded).filter(Boolean) as number[])
        .filter((y) => y !== brand.founded)
        .map((y) => ({ zh: String(y), en: String(y) }));
      return finalize(
        [`${brand.name}是哪一年成立的？`, `${brand.name}诞生于哪一年？`, `${brand.name}是哪年创办的？`],
        [`In what year was ${brand.nameEn} founded?`, `When was ${brand.nameEn} born?`, `${brand.nameEn} started in which year?`],
        truth,
        pool,
        s("yr"),
        s("yro"),
        s("yrp"),
        `${brand.name}成立于${brand.founded}年。`,
        `${brand.nameEn} was founded in ${brand.founded}.`,
        "brand-story",
      );
    }
    case "country": {
      if (!brand.country) return null;
      const truth: Pair = { zh: brand.country, en: brand.countryEn ?? brand.country };
      const poolRaw = others
        .filter((b) => b.country)
        .map((b) => ({ zh: b.country!, en: b.countryEn ?? b.country! }));
      // de-dup by zh
      const pool = uniq(poolRaw.map((p) => p.zh)).map((zh) => poolRaw.find((p) => p.zh === zh)!);
      return finalize(
        [`${brand.name}来自哪个国家？`, `${brand.name}的老家在哪里？`, `${brand.name}是哪个国家的品牌？`],
        [`Where does ${brand.nameEn} come from?`, `${brand.nameEn}'s home country is?`, `Which country is ${brand.nameEn} from?`],
        truth,
        pool,
        s("ct"),
        s("cto"),
        s("ctp"),
        `${brand.name}来自${brand.country}。`,
        `${brand.nameEn} is from ${truth.en}.`,
        "brand-story",
        true,
      );
    }
    case "category": {
      const truth: Pair = {
        zh: CATEGORY_LABELS[brand.category].zh,
        en: CATEGORY_LABELS[brand.category].en,
      };
      const pool = CATEGORIES.filter((c) => c !== brand.category).map((c) => ({
        zh: CATEGORY_LABELS[c].zh,
        en: CATEGORY_LABELS[c].en,
      }));
      return finalize(
        [`${brand.name}属于下面哪个品类？`, `把${brand.name}归类，它该放进哪一组？`, `${brand.name}是哪一类品牌？`],
        [`Which category does ${brand.nameEn} belong to?`, `${brand.nameEn} fits in which group?`, `What kind of brand is ${brand.nameEn}?`],
        truth,
        pool,
        s("cat"),
        s("cato"),
        s("catp"),
        `${brand.name}属于${truth.zh}。`,
        `${brand.nameEn} is in the ${truth.en} category.`,
        "product-thinking",
      );
    }
    case "slogan": {
      if (!brand.slogan) return null;
      const truth: Pair = { zh: brand.slogan, en: brand.sloganEn ?? brand.slogan };
      const pool = others
        .filter((b) => b.slogan)
        .map((b) => ({ zh: b.slogan!, en: b.sloganEn ?? b.slogan! }));
      return finalize(
        [`下面哪句是${brand.name}的口号？`, `${brand.name}的广告语是哪一句？`, `哪句话最能代表${brand.name}？`],
        [`Which is ${brand.nameEn}'s slogan?`, `${brand.nameEn}'s tagline is which one?`, `Which line best stands for ${brand.nameEn}?`],
        truth,
        pool,
        s("sl"),
        s("slo"),
        s("slp"),
        `${brand.name}的口号是"${brand.slogan}"。`,
        `${brand.nameEn}'s slogan is "${brand.sloganEn ?? brand.slogan}".`,
        "marketing-magic",
        true,
      );
    }
    case "number": {
      if (!brand.dataPoints || brand.dataPoints.length === 0) return null;
      const dp = pick(s("num"), brand.dataPoints);
      const truth: Pair = {
        zh: `${dp.value}${dp.unit ? " " + dp.unit : ""}`.trim(),
        en: `${dp.value}${dp.unitEn ? " " + dp.unitEn : dp.unit ? " " + dp.unit : ""}`.trim(),
      };
      const poolRaw = others
        .flatMap((b) => b.dataPoints ?? [])
        .map((d) => ({
          zh: `${d.value}${d.unit ? " " + d.unit : ""}`.trim(),
          en: `${d.value}${d.unitEn ? " " + d.unitEn : d.unit ? " " + d.unit : ""}`.trim(),
        }));
      const pool = uniq(poolRaw.map((p) => p.zh))
        .filter((zh) => zh !== truth.zh)
        .map((zh) => poolRaw.find((p) => p.zh === zh)!)
        .filter(Boolean);
      return finalize(
        [`关于${brand.name}的数字，哪个是真的？`, `猜猜看，${brand.name}的哪个数据是真的？`, `下面哪个数字属于${brand.name}？`],
        [`Which number about ${brand.nameEn} is real?`, `Guess: which fact about ${brand.nameEn} is true?`, `Which number belongs to ${brand.nameEn}?`],
        truth,
        pool,
        s("numd"),
        s("numo"),
        s("nump"),
        `${brand.name}的${dp.label}约是${truth.zh}。`,
        `${brand.nameEn}'s ${dp.labelEn ?? dp.label} is about ${truth.en}.`,
        "fun-data",
      );
    }
    default:
      return null;
  }
}

function buildQuiz(brand: Brand): QuizQuestion[] {
  const types: TypeKey[] = ["funfact", "founder", "year", "country", "category", "slogan", "number"];
  const ordered = shuffle(brand.id + "order", types);
  const qs: RawQuestion[] = [];
  for (const t of ordered) {
    const q = buildQuestion(brand, t);
    if (q) qs.push(q);
    if (qs.length >= 6) break;
  }

  // guarantee at least 2 questions
  if (qs.length < 2 && brand.keyFacts && brand.keyFacts[0]) {
    const truth: Pair = {
      zh: brand.keyFacts[0],
      en: brand.keyFactsEn?.[0] ?? brand.keyFacts[0],
    };
    const wrongs: Pair[] = [
      { zh: "它规定只有100岁以上才能买", en: "Only people over 100 can buy it" },
      { zh: "它的总部建在月球上", en: "Its headquarters is on the moon" },
      { zh: "它只卖恐龙骨头", en: "It only sells dinosaur bones" },
    ];
    const all = shuffle(brand.id + "qxo", [truth, ...wrongs]).slice(0, 4);
    qs.push({
      id: "q-extra",
      question: `下面哪个是关于${brand.name}的事实？`,
      questionEn: `Which is a fact about ${brand.nameEn}?`,
      options: all.map((p) => p.zh),
      optionsEn: all.map((p) => p.en),
      correct: all.findIndex((p) => p.zh === truth.zh),
      explanation: truth.zh,
      explanationEn: truth.en,
      dimension: "fun-data",
    });
  }

  return qs;
}

// ───────────────────────── podcast script ─────────────────────────

const HOST1 = "乐乐"; // fox 🦊
const HOST2 = "问问"; // rabbit 🐰
const HOST1_EN = "Foxy";
const HOST2_EN = "Bun";

function buildScript(brand: Brand, cards: Card[], sections: KnowledgeSection[]): PodcastScript {
  const byId = (id: string) => cards.find((c) => c.id === id);
  const storySection = sections.find((s) => s.dimension === "brand-story");
  const moneySection = sections.find((s) => s.dimension === "money-logic");
  const marketingSection = sections.find((s) => s.dimension === "marketing-magic");
  const compSection = sections.find((s) => s.dimension === "competition");

  const segs: Omit<PodcastSegment, "id">[] = [];
  const add = (
    speaker: "host1" | "host2",
    text: string,
    textEn: string,
    cardId?: string,
  ) => segs.push({ speaker, text, textEn, cardId });

  add("host1", `欢迎来到 BrandPedia Kids！我是${HOST1}。`, `Welcome to BrandPedia Kids! I'm ${HOST1_EN}.`, byId("c-intro")?.id);
  add("host2", `我是${HOST2}！今天我们要聊的品牌是——${brand.name}！${brand.logo}`, `And I'm ${HOST2_EN}! Today we're talking about — ${brand.nameEn}! ${brand.logo}`);
  add("host1", `你知道吗？${brand.funFact ?? brand.description}`, `Did you know? ${brand.funFactEn ?? brand.descriptionEn}`, byId("c-story")?.id);
  if (storySection) {
    add("host2", `它是怎么来的呢？${firstSentence(storySection.content)}`, `How did it begin? ${firstSentenceEn(storySection.contentEn)}`);
    add("host1", restSentences(storySection.content), restSentencesEn(storySection.contentEn));
  }
  add("host2", `那${brand.name}是怎么赚钱的呢？`, `So how does ${brand.nameEn} make money?`);
  if (moneySection) {
    add("host1", firstSentence(moneySection.content), firstSentenceEn(moneySection.contentEn), byId("c-chart")?.id);
  }
  const chart = byId("c-chart");
  if (chart && chart.payload.kind === "chart") {
    const p = chart.payload;
    const labelEn = (p.labelsEn && p.labelsEn[0]) ?? p.labels[0];
    add("host2", `看这个数据：${p.labels[0]}就有${p.values[0]}${p.unit ?? ""}！厉害吧？`, `Look at this: ${labelEn} is ${p.values[0]}${p.unitEn ? " " + p.unitEn : ""}! Cool, right?`, chart.id);
  }
  add("host1", `${brand.name}的品牌时间线也很有意思，一路走来不容易呢。`, `${brand.nameEn}'s timeline is really interesting too — quite a journey.`, byId("c-timeline")?.id);
  if (marketingSection) add("host2", firstSentence(marketingSection.content), firstSentenceEn(marketingSection.contentEn));
  if (compSection) add("host1", firstSentence(compSection.content), firstSentenceEn(compSection.contentEn));
  add("host1", `记住啦，${brand.name}的故事就讲到这儿！`, `Remember that — that's the story of ${brand.nameEn}!`);
  add("host2", `下次再见，Bye~ 👋`, `See you next time, bye! 👋`);

  return {
    brandId: brand.id,
    host1Name: HOST1,
    host2Name: HOST2,
    host1NameEn: HOST1_EN,
    host2NameEn: HOST2_EN,
    segments: segs.map((s, i) => ({ ...s, id: `s${i + 1}` })),
  };
}

// ───────────────────────── main entry ─────────────────────────

export function generateContent(brand: Brand): BrandContent {
  const sections = DIMENSIONS.map((d) => composeSection(brand, d));
  const quiz = buildQuiz(brand);
  const cards = buildCards(brand);
  const script = buildScript(brand, cards, sections);
  const related = getRelated(brand.slug).map((b) => b.slug);

  return {
    brand,
    sections,
    script,
    cards,
    quiz,
    related,
    generated: brand.generated ?? false,
  };
}

export { firstSentence, firstSentenceEn };
