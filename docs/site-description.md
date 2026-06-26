# Site Description · BrandPedia Kids

## In one line

BrandPedia Kids is an **AI-driven children's business encyclopedia** for ages 6–14 that turns everyday brands into business stories kids can understand and remember — delivered through a dual-host podcast and illustrated cards that sync to the podcast.

## Product vision

Help kids understand how the business world works, at the age when they're just getting to know it.

From a Starbucks coffee to a Disneyland ticket, from a pair of Nike sneakers to an Apple phone, every brand hides a business story about pricing, supply chains, marketing, and consumer psychology. BrandPedia Kids uses AI to turn those stories into content kids can understand and remember.

## Target users

- **Primary**: Children aged 6–14 (used with a parent)
- **Secondary**: Parents, educators, anyone interested in accessible business explainers

## Core experiences

1. **Home · Brand Logo Wall**: A playful brand grid (food & beverage / entertainment / technology / sports / retail / transport / other). Logos enlarge on hover and show their slogan; clicking flips to a fun fact, then enters the detail page.
2. **Brand detail · Podcast + illustrated cards**:
   - **Voice podcast mode**: Two virtual hosts explain the brand conversationally, 3–5 minutes, in kid-friendly language.
   - **Illustrated card flow**: Image-text, animated data charts, fun quiz, and timeline cards that auto-highlight in sync with the podcast.
   - A bottom Mini Player supports play/pause, scrubbing, and speed control (0.8x / 1x / 1.2x).
3. **Custom brand exploration**: Type any brand a kid is curious about, and the backend AI generates the full explainer with a robot-loading animation, then redirects to the detail page.

## Knowledge dimensions

Every brand is explained across six angles: Brand Story, Product Thinking, Money Logic, Marketing Magic, Competition, Fun Data.

## Educational value

- Uses brands kids already know as the entry point, lowering the barrier to business concepts.
- Cultivates a "why" mindset: Why does Coke cost about the same worldwide? Why isn't McDonald's just a home kitchen?
- Cross-disciplinary: business + data + history + language (bilingual).

## Technical overview

- **Frontend**: Next.js (App Router) + React + TypeScript + Tailwind CSS + Framer Motion.
- **Audio**: Browser Web Speech API (default, zero-config) + ElevenLabs/Azure adapter (optional).
- **AI**: LLM script generation + TTS audio + DALL·E images (all optionally enabled by key, with offline template fallbacks).
- **Storage**: Local JSON (default) + Supabase adapter (optional).
- **Design**: Out-of-the-box runtime + real-service adapters waiting to be activated; bilingual.

## Content safety & responsibility

- Content is made for children and avoids scary, violent, or inappropriate material.
- Competitive and business descriptions stay objective and never disparage a specific brand.
- Brand names and logos are represented with emoji to avoid trademark issues; AI-generated content is for educational reference only.

## Business type

B2C · Education and cultural-creative industry.
