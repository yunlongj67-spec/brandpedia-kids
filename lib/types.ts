// BrandPedia Kids — core data schema
// All brand learning content (preset + AI-generated) conforms to these types.
// See docs/ai-content-schema.md for the human-readable spec and writing guidelines.

export type Category =
  | "food-beverage"
  | "entertainment"
  | "technology"
  | "sports"
  | "retail"
  | "transport"
  | "other";

export type Dimension =
  | "brand-story"
  | "product-thinking"
  | "money-logic"
  | "marketing-magic"
  | "competition"
  | "fun-data";

export type CardType = "image-text" | "chart" | "quiz" | "timeline";

export type Speaker = "host1" | "host2";

/** A brand's identity + metadata used to generate or hand-author its content. */
export interface Brand {
  id: string;
  name: string; // 中文
  nameEn: string;
  slug: string;
  category: Category;
  logo: string; // emoji used as the kid-friendly "logo"
  color: string; // hex theme color for cards / accents
  slogan: string;
  sloganEn: string;
  description: string;
  descriptionEn: string;
  featured?: boolean;
  generated?: boolean;

  // real-world facts (used by the generator)
  founded?: number;
  founder?: string;
  founderEn?: string;
  country?: string;
  countryEn?: string;
  /** cold fact shown on the back of the logo card before entering detail */
  funFact?: string;
  funFactEn?: string;
  keyFacts?: string[];
  keyFactsEn?: string[];

  // optional hand-authored rich prose per dimension (featured brands).
  // When present the generator uses these verbatim; otherwise it composes from templates.
  story?: string;
  storyEn?: string;
  product?: string;
  productEn?: string;
  money?: string;
  moneyEn?: string;
  marketing?: string;
  marketingEn?: string;
  competition?: string;
  competitionEn?: string;
  funData?: string;
  funDataEn?: string;

  /** structured numbers → rendered as an animated bar-chart card */
  dataPoints?: { label: string; labelEn?: string; value: number; unit?: string; unitEn?: string }[];
  /** structured history → rendered as a timeline card */
  timeline?: TimelineEvent[];
}

export interface KnowledgeSection {
  dimension: Dimension;
  title: string;
  titleEn: string;
  content: string;
  contentEn: string;
  keyPoints: string[];
  keyPointsEn: string[];
  funFact?: string;
  funFactEn?: string;
}

export interface PodcastSegment {
  id: string;
  speaker: Speaker;
  text: string;
  textEn?: string;
  /** card to highlight while this segment plays (enables podcast↔card sync) */
  cardId?: string;
}

export interface PodcastScript {
  brandId: string;
  host1Name: string;
  host2Name: string;
  host1NameEn?: string;
  host2NameEn?: string;
  segments: PodcastSegment[];
}

export interface ImageTextPayload {
  kind: "image-text";
  emoji: string;
  text: string;
  textEn?: string;
}

export interface ChartPayload {
  kind: "chart";
  chartType: "bar";
  unit?: string;
  unitEn?: string;
  labels: string[];
  labelsEn?: string[];
  values: number[];
  caption: string;
  captionEn?: string;
}

export interface QuizPayload {
  kind: "quiz";
  question: string;
  questionEn?: string;
  options: string[];
  optionsEn?: string[];
  correct: number;
  explanation: string;
  explanationEn?: string;
}

export interface TimelineEvent {
  year: string;
  title: string;
  titleEn?: string;
  desc: string;
  descEn?: string;
}

export interface TimelinePayload {
  kind: "timeline";
  events: TimelineEvent[];
}

export type CardPayload =
  | ImageTextPayload
  | ChartPayload
  | QuizPayload
  | TimelinePayload;

export interface Card {
  id: string;
  type: CardType;
  title: string;
  titleEn?: string;
  payload: CardPayload;
}

export interface QuizQuestion {
  id: string;
  question: string;
  questionEn?: string;
  options: string[];
  optionsEn?: string[];
  correct: number;
  explanation: string;
  explanationEn?: string;
  dimension: Dimension;
}

/** Full learning bundle for one brand. */
export interface BrandContent {
  brand: Brand;
  sections: KnowledgeSection[];
  script: PodcastScript;
  cards: Card[];
  quiz: QuizQuestion[];
  related: string[]; // slugs
  generated?: boolean;
}

export interface SearchHistoryEntry {
  id: string;
  query: string;
  ts: number;
  result: "found" | "generated";
  brandSlug?: string;
}

/** A kid's wish from the "what do you want to learn?" survey. */
export interface WishlistEntry {
  id: string;
  wish: string; // the brand the kid wants to learn about
  category?: Category | null;
  dimension?: Dimension | null;
  ts: number;
}

export const CATEGORY_LABELS: Record<Category, { zh: string; en: string }> = {
  "food-beverage": { zh: "食品饮料", en: "Food & Drink" },
  entertainment: { zh: "娱乐", en: "Entertainment" },
  technology: { zh: "科技", en: "Technology" },
  sports: { zh: "运动", en: "Sports" },
  retail: { zh: "零售", en: "Retail" },
  transport: { zh: "出行", en: "Transport" },
  other: { zh: "其他", en: "Other" },
};

export const DIMENSION_LABELS: Record<Dimension, { zh: string; en: string }> = {
  "brand-story": { zh: "品牌故事", en: "Brand Story" },
  "product-thinking": { zh: "产品思维", en: "Product Thinking" },
  "money-logic": { zh: "赚钱逻辑", en: "Money Logic" },
  "marketing-magic": { zh: "营销魔法", en: "Marketing Magic" },
  competition: { zh: "竞争关系", en: "Competition" },
  "fun-data": { zh: "趣味数据", en: "Fun Data" },
};

export const CATEGORIES: Category[] = [
  "food-beverage",
  "entertainment",
  "technology",
  "sports",
  "retail",
  "transport",
  "other",
];

export const DIMENSIONS: Dimension[] = [
  "brand-story",
  "product-thinking",
  "money-logic",
  "marketing-magic",
  "competition",
  "fun-data",
];
