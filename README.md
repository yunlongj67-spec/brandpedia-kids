# 🧭 BrandPedia Kids

> An AI-driven children's business encyclopedia — helping kids understand how the business world works, at the age when they're just getting to know it.

BrandPedia Kids is built for **kids aged 6–14**. It uses AI to turn the brands kids encounter every day (a Starbucks coffee, a Disneyland ticket, a pair of Nike sneakers…) into business stories they can understand and remember. Every brand comes with a **dual-host podcast** plus **illustrated cards that sync to the podcast**, across six knowledge dimensions.

**✨ Runs out of the box** — no API key required. The podcast uses the browser's built-in speech (two voices), visuals use emoji / SVG, and storage uses local JSON. It also ships with ElevenLabs/Azure, DALL·E, LLM, and Supabase adapters that automatically upgrade to real services the moment you add an env key.

---

## 🎯 Core Features

- 🏢 **Brand Logo Wall**: 31 curated brands across 7 categories — food & beverage / entertainment / technology / sports / retail / transport / other.
- 🎙️ **Podcast + illustrated cards**: Two virtual hosts (a fox 🦊 and a rabbit 🐰) explain each brand in a conversational style. A bottom Mini Player supports play/pause, scrubbing, and speed control (0.8x / 1x / 1.2x), and cards auto-highlight in sync with the podcast segments.
- 🃏 **Flip cards**: Logo cards enlarge on hover and show the slogan; on click they flip to reveal a fun fact, then enter the detail page.
- 🤖 **Explore new brands**: Type any brand name (e.g. "Pop Mart", "Mixue") and AI generates the full explainer, with a robot-flipping-through-a-book loading animation.
- 📝 **Kid survey**: Ask kids what brand they want to learn — curated brands get an accurate intro, uncatalogued ones are generated on the fly by AI. The app remembers everyone's wishes.
- 🧠 **Knowledge quiz**: 4 questions per brand, each with different question types, wording, and distractors, with a final score.
- 🌏 **Bilingual**: One-click Chinese / English UI toggle.
- 🔍 **Debounced search + suggestion dropdown**.

## 📚 Knowledge Dimensions

Every brand is explained across six angles: Brand Story / Product Thinking / Money Logic / Marketing Magic / Competition / Fun Data.

---

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> Requires Node.js 18.18+ (20+ recommended). Developed on Node 26 / npm 11.

Optional: copy the env template and fill in keys as needed (it runs fine without any):

```bash
cp .env.example .env.local
```

## 📜 Common Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server → http://localhost:3000 |
| `npm run build` | Production build |
| `npm run start` | Run the production server |

**Start & stop cleanly.** Always stop the dev server with `Ctrl + C` before closing the terminal or starting another. If the page ever loads blank or buttons stop responding, a `next` process was left running — kill it and restart:

```bash
pkill -f next        # or:  lsof -ti:3000 | xargs kill -9
npm run dev          # one clean server
```

**Open from another device on your Wi-Fi.** Next.js prints a **Network** URL on startup (e.g. `http://192.168.x.x:3000`); open it in your phone/iPad browser (both devices on the same network). If it won't load, bind to all interfaces: `npm run dev -- -H 0.0.0.0`.

See [`docs/installation-and-deployment.md`](./docs/installation-and-deployment.md) → *Starting & stopping the server* for full details.

---

## 🧱 Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Framer Motion
- **Audio**: Browser Web Speech API (default); ElevenLabs / Azure TTS adapter (key-activated)
- **AI**: LLM adapter (OpenAI-compatible, offline fallback to a template generator) + DALL·E image adapter
- **Storage**: Local JSON (default); Supabase REST adapter (key-activated)

## 📁 Project Structure

```
app/                  # Next.js App Router pages & APIs
  page.tsx            # Home: brand logo wall
  brand/[slug]/       # Brand detail page
  explore/            # Explore new brands
  generated/[id]/     # AI-generated result page
  api/                # brands / search / generate(SSE) / tts
component/            # BrandCard / Broadcastplayer / Branddetail / quiz / CardFlow ...
lib/                  # types / brands / contentTemplates / storage / ai / podcast-utils / i18n
data/                 # Local JSON storage (generated brands + search history)
docs/                 # Documentation
```

For full structure, data schema, deployment, and the test checklist, see [`docs/`](./docs):

- [`docs/ai-content-schema.md`](./docs/ai-content-schema.md) — AI content schema & writing guidelines
- [`docs/site-description.md`](./docs/site-description.md) — Site description
- [`docs/installation-and-deployment.md`](./docs/installation-and-deployment.md) — Installation & deployment guide
- [`docs/testing-checklist.md`](./docs/testing-checklist.md) — Test checklist

---

## 🔌 Optional: Connect real AI services

With no keys at all, the app uses browser speech + a local template generator. Add the matching key and it auto-upgrades:

| Feature | Env variable | Description |
| --- | --- | --- |
| LLM content generation | `OPENAI_API_KEY` (+ optional `OPENAI_BASE_URL` / `OPENAI_MODEL`) | "Explore new brand" uses a real LLM for richer content |
| High-quality TTS | `ELEVENLABS_API_KEY` or `AZURE_SPEECH_KEY`+`AZURE_SPEECH_REGION` | Pre-synthesizes podcast audio, enabling true scrubbing |
| AI illustration | `OPENAI_API_KEY` | DALL·E generates brand illustrations |
| Cloud storage | `USE_SUPABASE=true` + `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | Replaces local JSON (recommended for Serverless) |

---

## 📝 License

MIT
