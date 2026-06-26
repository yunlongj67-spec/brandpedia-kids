# AI Content Schema · BrandPedia Kids

This document defines the data structure, generation rules, and kid-friendly writing guidelines for brand content (`BrandContent`).
All preset brands and AI-generated brand content follow this schema (see `lib/types.ts`).

---

## 1. Top-level structure `BrandContent`

```ts
interface BrandContent {
  brand: Brand;                 // brand metadata
  sections: KnowledgeSection[]; // 6 knowledge dimensions (fixed order)
  script: PodcastScript;        // dual-host podcast script
  cards: Card[];                // illustrated cards (linked to segments via cardId)
  quiz: QuizQuestion[];         // knowledge quiz (≥2, recommended 4)
  related: string[];            // related-brand slug list
  generated?: boolean;          // whether AI-generated
}
```

## 2. `Brand` metadata

| Field | Type | Description |
| --- | --- | --- |
| `id`, `slug` | string | unique id / URL-friendly slug (non-Latin names map to romanized slugs; see `lib/slug.ts`) |
| `name`, `nameEn` | string | primary / English name |
| `category` | enum | `food-beverage` / `entertainment` / `technology` / `sports` / `retail` / `transport` / `other` |
| `logo` | string | emoji, used as the playful "logo" |
| `color` | hex | theme color, drives cards and accents |
| `slogan`, `sloganEn` | string | brand slogan |
| `description`, `descriptionEn` | string | one-line description |
| `featured` | boolean? | curated (pinned on home + deeper content) |
| `generated` | boolean? | AI-generated |
| `founded`, `founder`, `country` | — | real facts used by the generator |
| `funFact`, `funFactEn` | string? | fun fact (shown on the back of the logo card) |
| `keyFacts` | string[]? | 3–5 key facts |
| `story`/`product`/`money`/`marketing`/`competition`/`funData` (+`En`) | string? | hand-written 6-dimension copy (curated brands); when absent, the template generator fills in |
| `dataPoints` | `{label,value,unit}[]?` | structured numbers → animated bar-chart card |
| `timeline` | `{year,title,desc}[]?` | structured history → timeline card |

## 3. `KnowledgeSection` (the 6 dimensions)

```ts
interface KnowledgeSection {
  dimension: "brand-story" | "product-thinking" | "money-logic"
           | "marketing-magic" | "competition" | "fun-data";
  title: string;      titleEn: string;
  content: string;    contentEn: string;   // primary language text + secondary summary
  keyPoints: string[]; keyPointsEn: string[];
  funFact?: string;   funFactEn?: string;
}
```

The six dimensions in fixed order and meaning:

| Dimension | Meaning | What it covers |
| --- | --- | --- |
| `brand-story` | Brand Story | origins, founder, memorable moments |
| `product-thinking` | Product Thinking | what they sell, why it resonates |
| `money-logic` | Money Logic | how they earn, revenue and cost |
| `marketing-magic` | Marketing Magic | how they get known, why ads work |
| `competition` | Competition | who the rivals are, how they compete |
| `fun-data` | Fun Data | memorable numbers and surprising facts |

## 4. `PodcastScript` (dual-host podcast)

```ts
interface PodcastScript {
  brandId: string;
  host1Name: string;   // the fox host 🦊
  host2Name: string;   // the rabbit host 🐰
  segments: PodcastSegment[];   // 8–14 segments, alternating hosts
}
interface PodcastSegment {
  id: string;                       // e.g. "s1"
  speaker: "host1" | "host2";
  text: string;                     // one spoken line
  cardId?: string;                  // card highlighted while this segment plays
}
```

**Card sync**: when a `segment` sets a `cardId`, the player highlights and scrolls to that card when it reaches the segment. The generator binds cards to the intro, story, data, timeline, and quiz segments.

**Duration estimate**: in Web Speech mode, a segment's duration = `word count / (5.2 × speed)`, used for the progress bar (see `lib/podcast-utils.ts`).

## 5. `Card` (illustrated card, 4 types)

```ts
type CardPayload = ImageTextPayload | ChartPayload | QuizPayload | TimelinePayload;
interface Card {
  id: string;                 // e.g. "c-intro", linked to segment.cardId
  type: "image-text" | "chart" | "quiz" | "timeline";
  title: string; titleEn?: string;
  payload: CardPayload;
}
```

- **image-text**: `{ kind:"image-text", emoji, text, textEn }`
- **chart**: `{ kind:"chart", chartType:"bar", unit?, labels[], values[], caption, captionEn }`
- **quiz**: `{ kind:"quiz", question, options[4], correct, explanation }` (an interactive question embedded in the card flow)
- **timeline**: `{ kind:"timeline", events:[{year,title,desc}] }`

## 6. `QuizQuestion` (knowledge quiz)

```ts
interface QuizQuestion {
  id: string;
  question: string; questionEn?: string;
  options: string[];          // 4 options
  correct: number;            // index of the correct option
  explanation: string; explanationEn?: string;
  dimension: Dimension;
}
```

---

## 7. Kid-friendly writing guide (ages 6–14)

1. **Short sentences first**: no more than ~20 words per sentence; split complex ideas into two or three.
2. **Lean on analogies**: replace abstract business concepts with everyday scenes (e.g. "McDonald's is basically a big landlord").
3. **Second person**: use "you" and "we" so kids feel involved.
4. **Concrete numbers**: prefer tangible figures like "1.9 billion bottles a day" over "revenue grew X%".
5. **Questions and dialogue**: lean on "Did you know?" and "So how does it make money?" in podcast scripts.
6. **Avoid jargon**: don't use "supply chain / gross margin / moat" — or explain them in plain language the moment they appear.
7. **Safe and positive**: avoid scary, violent, or inappropriate content; keep competitive descriptions objective and never disparaging.
8. **Bilingual**: primary-language text with a short (1–2 sentence) English summary, useful for language learning.

## 8. Generator & adapters

- **Template generator** `lib/contentTemplates.ts`: `generateContent(brand)` produces a full `BrandContent` from metadata + dimension templates; curated brands prefer their hand-written copy fields.
- **Offline brand synthesis** `lib/customBrand.ts`: `synthesizeBrand(name)` synthesizes metadata from a brand name so "Explore new brand" works without an LLM.
- **LLM adapter** `lib/ai/llm.ts`: when `OPENAI_API_KEY` is present, calls a real LLM (outputting JSON per this schema) and automatically falls back to the template generator on failure.
- **Storage** `lib/storage.ts`: local JSON by default; when `USE_SUPABASE=true`, writes to the `brands` table in Supabase (the `content` column holds the `BrandContent` JSON defined here).
