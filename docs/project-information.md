# BrandPedia Kids — Project Information

> English-only deliverable. Content follows [`overview.md`](../overview.md); sections are reorganized so the write-up begins with **1. AI Innovation**.

---

## 1. AI Innovation

BrandPedia Kids uses AI as the engine that creates every piece of content, on demand, for any brand. A single input — a brand name a child types — triggers a pipeline that produces a complete, synchronized, multi-modal lesson: a conversational two-host podcast, illustrated knowledge cards that highlight in sync with the audio, and a quiz.

- **Generate an episode, don't search an encyclopedia.** The AI Agent generates the full material for *any* brand a child is curious about — including brands no one has curated (e.g., Pop Mart, Mixue, Paw Patrol) — in about 2–3 minutes, with a friendly "robot reading a book" loading animation. The content library is effectively infinite and self-updating, not finite and static.
- **Conversational two-host podcast.** An LLM writes each brand's story as a dialogue between two virtual hosts, and a TTS model (ElevenLabs / Azure) gives each host a distinct voice, in language a 6–14-year-old can follow.
- **Audio ↔ card synchronization.** The AI emits a structured script in which each spoken segment is linked to a knowledge card; as the podcast plays, the matching card highlights automatically. "What you hear is what you see."
- **Consistent six-dimension framework.** Every brand is explained across the same six lenses, encoded in the generation schema, so AI turns heterogeneous brand information into a uniform, complete curriculum.
- **Multi-modal generation.** LLM writes the script, TTS generates the audio, and an image model (DALL·E / SD) creates the visuals — all coordinated by one pipeline.

---

## 2. Product Vision

Let children understand how the business world works, at the age when they are just getting to know it.

From a Starbucks coffee to a Disney ticket, from a pair of Nike sneakers to an Apple phone — every brand hides a business story about pricing, supply chains, brand marketing, and consumer psychology. BrandPedia Kids uses AI to turn these stories into content that kids can understand and remember.

---

## 3. Core Experience

- **Home — Brand Logo Wall.** A playful grid of brand logos opens the app: Disney, Coca-Cola, Starbucks, Nike, Apple, LEGO, McDonald's, IKEA — about 30–50 curated brands across food & beverage, entertainment, technology, sports, and retail. Each logo has a cute icon design; tap to enter the brand story.
- **Brand detail page — Podcast + illustrated cards.** Like a mini podcast show, with two presentation modes:
  - **Voice podcast mode:** AI-generated conversational audio in which two virtual hosts chat through the brand's story. For example, for Coca-Cola: What is its secret formula? Why does a bottle cost about the same all over the world? Why are its ads always about happiness rather than thirst? Each podcast is 3–5 minutes, at a moderate pace, in kid-understandable language.
  - **Illustrated card flow:** Images, animation GIFs, and short video clips shown in sync with the podcast. Each time the topic changes, the next card flips in. Card content includes brand-history photos, product-evolution diagrams, and fun data visualizations (e.g., an animated bar chart of how many Cokes are sold in a day).
- **Custom brand exploration.** A search box and an "I want to explore a new brand" entry sit at the top. A child can type any brand they are curious about — for example Pop Mart, Mixue, or Paw Patrol. On submit, the backend AI Agent automatically generates the complete explainer material, including the podcast script, audio, and image cards. Generation takes about 2–3 minutes, with a cute loading animation during the wait.

---

## 4. Knowledge Dimensions

Each brand is explained across the following dimensions, in language kids can understand:

- **Brand Story** — where the brand came from, who founded it, and interesting things that happened along the way.
- **Product Thinking** — what they sell and why that product moves people.
- **Money Logic** — how the brand makes money, its revenue sources, and roughly what its costs are.
- **Marketing Magic** — how they get people to know their product, and why their ads look good.
- **Competition** — who the brand's rivals are and how they compete.
- **Fun Data** — memorable numbers and surprising facts.

---

## 5. Technology Stack

- **Frontend:** Next.js (React) + Tailwind CSS + Framer Motion; a custom podcast player; debounced search with a brand-suggestion dropdown.
- **Backend:** Next.js API Routes / Node.js.
- **AI engine:** LLM API to write the product script + TTS (ElevenLabs / Azure) to generate audio + image generation (DALL·E / SD).
- **Storage:** PostgreSQL / Supabase (brand information) + Redis + DB (cache) + OSS (audio files) + persisted user search history used to optimize hot-brand recommendations.
- **Interaction:** logo flip animation, a bottom Mini Player bar, and card-swipe synchronized highlighting.

---

## 6. Page Structure & Interaction

**Page structure**

```
Home (Brand Logo Wall)
├── Search box
├── Category filter (Food / Entertainment / Tech / Sports / Retail)
├── Brand logo grid
│   ├── Tap to enter → Brand detail page
│   ├── Podcast player (fixed at top)
│   ├── Illustrated card flow (scrolls with the podcast rhythm)
│   ├── Optional knowledge quiz
│   └── Related-brand recommendations
├── "Explore a new brand" entry
└── Type a brand name → AI generation loading → on completion, jump to the detail page
```

**Interaction details**

- **Brand logo card:** on hover the logo gently enlarges and shows the brand slogan; on click the card flips, the back shows a fun brand fact as a transition, then the detail page opens.
- **Podcast player:** a bottom fixed bar like a music app's mini player. Supports play/pause, progress scrubbing, and speed switching (0.8x / 1x / 1.2x). While playing, the matching illustrated card auto-highlights in sync.
- **Illustrated cards:** each card supports left/right swipe. Card types include image + text, data chart, fun quiz, and timeline.
- **New-brand generation:** after typing a brand name, a fun waiting animation appears (e.g., a little robot flipping through a book looking for information). Estimated wait 2–3 minutes. On completion a notification pops up; tapping it goes straight to the brand page.

---

## 7. Preset Brand Library

- **Food & beverage:** Coca-Cola, McDonald's, Starbucks, Lay's, Yili
- **Entertainment:** Disney, LEGO, Nintendo, Pop Mart, Universal Studios
- **Technology:** Apple, Google, Microsoft, DJI, OpenAI
- **Sports:** Nike, Adidas, ANTA, Li-Ning
- **Retail:** IKEA, Walmart, MINISO, 7-Eleven
- **Transport:** Tesla, BYD, DiDi, Uber
- **Other:** Barbie (Mattel), New Oriental, TAL, Michelin
