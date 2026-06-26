# BrandPedia Kids — Speaker Script

**Event:** IAI²O 2026 — International AI Innovation Olympiad
**Track:** AI for Business (AI4BIZ)
**Project:** BrandPedia Kids · AI-driven children's business encyclopedia
**Companion deck:** `BrandPedia-Kids-Slides.html` / `BrandPedia-Kids.pptx` (15 slides)
**Target length:** 12–15 minutes (including ~1 min live demo)

> How to use: each section maps to one slide. `[…]` marks suggested timing and stage cues; the rest is spoken word. Read naturally — this is a guide, not a script to recite verbatim.

---

## Slide 1 · Cover (Opening · 30s)

Good morning, judges and teachers!

We are the **BrandPedia Kids** team. The project we're presenting today can be summed up in one sentence:

> **We turn everyday brands into stories kids can actually understand.**

It's an AI-driven business encyclopedia for children aged six to fourteen. We're entering the **AI for Business** track — because this isn't just a technical demo, it's a clear, viable path to a real product and revenue.

Over the next twelve minutes, I'll walk you through **why we built it, what it does, how it works, and how it makes money.**

---

## Slide 2 · The Problem (1 min)

*move to the problem slide*

Let's start with something we all overlook.

Today's kids are surrounded by brands from morning to night — the milk at breakfast, the sneakers on their feet, the phone in their hand, the theme park on weekends. But ask a ten-year-old: why does a bottle of Coke cost about the same everywhere in the world? Why are Disneyland tickets so expensive? Why do Nike's ads talk about spirit and never about price? — they can't answer.

Behind those questions is real business logic: pricing, supply chains, brand psychology, consumer decisions. And here's our reality:

1. **Kids are surrounded by brands but don't understand the business behind them.**
2. **Traditional financial education is dry and abstract — they tune out.**
3. **Parents want to teach, but can't find anything a kid can actually follow.**
4. And ages six to fourteen — the golden window for learning about the world — are a **complete blank zone** for business literacy.

That's the problem we set out to solve.

---

## Slide 3 · Our Answer (1 min)

Our answer is **BrandPedia Kids** — an AI-driven children's business encyclopedia.

The core idea rests on three words:

- **Listen, don't read.** We don't hand kids an encyclopedia to read. We give them a conversational podcast — two virtual hosts chat through each brand like a story, three to five minutes an episode.
- **Understand, not just watch.** Every brand is broken down across six knowledge dimensions, so the business logic becomes something kids remember.
- **Explore any brand.** A kid types any brand they're curious about, and the AI generates the full story on the spot.

In one line — **we use AI to translate the complex business world into a child's language.**

---

## Slide 4 · Product at a Glance (1 min)

*ideal moment for a live demo*

Open the site and you see three core experiences.

**First, the Logo Wall home.** Thirty-plus curated brands in a playful grid. Hover and the logo grows and shows a slogan; click and it flips to reveal a fun fact, then takes you into the detail page — that moment is itself delightful.

**Second, the podcast plus card-flow detail page.** This is the heart. At the bottom sits a Mini Player, like a music app — play, scrub, change speed. As it plays, the illustrated cards above **flip and highlight in sync with the audio.**

**Third, explore a new brand.** A kid types something they genuinely wonder about — "Pop Mart," "Mixue," "Paw Patrol" — and the AI goes to work. While it runs, a little robot flips through a book looking things up. Two or three minutes later, they land on a fully-built brand page.

---

## Slide 5 · The Experience Loop (1 min)

We designed the whole journey as a **learning loop**:

**Browse → listen and sync → quiz → explore** — and back to browse, going deeper each time.

I want to highlight one mechanism on this slide — **podcast-to-card sync.**

Technically, every segment of podcast audio is bound to a card — the field is called `segment.cardId`. When the audio reaches a segment, that card highlights and scrolls into view. In other words:

> **What a kid hears is what they see.**

That's multimodal learning, and it's far more memorable than listening alone or watching alone.

---

## Slide 6 · Six Knowledge Dimensions (45s)

*you can move faster here*

Every brand is told across six dimensions:

📖 Brand Story — how it began, who founded it;
💡 Product Thinking — what it sells and why it resonates;
💰 Money Logic — how it earns, roughly what it costs;
✨ Marketing Magic — why the ads work;
⚔️ Competition — who the rivals are;
📊 Fun Data — numbers and facts that stick.

These six dimensions are really a **scaffolding for business thinking.** A kid isn't learning one brand — they're learning a way to see the world.

---

## Slide 7 · Tech Architecture (1 min)

*technical judges: focus here and the next slide*

On the stack, we use Next.js 16, React 19, TypeScript, Tailwind CSS v4, and Framer Motion — a single, cleanly layered architecture.

Top to bottom, four layers:

1. **Client UI** — all interaction, animation, flip cards;
2. **API layer** — Next.js Route Handlers: brands, search, generate, TTS, and the wishlist endpoints. The "generate" endpoint uses **SSE streaming** to push progress live;
3. **AI adapter layer** — this is the key, I'll cover it next;
4. **Local fallback layer** — browser speech, SVG charts, a template generator, and local JSON storage.

---

## Slide 8 · The Key Decision (1.5 min · the centerpiece)

This slide is the most important engineering decision in the project, and the one we're proudest of.

We built an **adapter pattern.**

**On the left: it runs fully with zero API keys.** The browser's native Web Speech API gives us dual voices, SVG and emoji generate charts and illustrations, a template generator produces the six-dimension content, and local JSON handles storage.

That means — **judges can run `npm install` and `npm run dev` today, with no keys whatsoever, and experience the full product.**

**On the right: the moment you set an environment variable, the same interface switches to real services.** Add an OpenAI key — a real LLM writes the scripts. Add ElevenLabs or Azure — you get studio-grade TTS. Add DALL·E — real brand illustrations. Turn on Supabase — cloud storage, ready for Serverless.

Why design it this way? Because it satisfies **demoability** and **scalability** at the same time — from demo to production with **zero code migration.** For an early-stage product, that's a serious commercial advantage.

---

## Slide 9 · AI Engineering (1 min)

We use AI **deliberately, responsibly, and designed for kids.** Four details:

1. **Dual-voice conversational podcast:** we pick one male and one female voice from `getVoices()`, distinguish them by pitch, and support speed control and segment-seek.
2. **Deterministic seeding — FNV hashing:** the same input always yields the same output, which eliminates server-side-rendering hydration mismatches and keeps content stable.
3. **Seven question types, zero wrong answers:** we verified correctness across the board — every brand's distractors are drawn from **other brands' real data**, so options never repeat, and there are **zero incorrect answers** in the whole site.
4. **SSE streaming generation:** when exploring a new brand, progress streams stage by stage, and the loading animation stays in sync with the backend.

---

## Slide 10 · Content Quality (1 min)

We don't generate AI fluff. The content is **real, varied, and calibrated for kids.**

On the left, real data: **thirty-one curated brands across seven categories**, with year founded, founder, country, and slogan all hand-verified. The six dimensions use three template variants anchored to distinct facts, so **there's no repetition.** And the whole thing is bilingual.

On the right, the part I want you to remember — a **data flywheel.** We built a three-step kid survey that asks "what brand do you want to learn?", then smart-searches for an accurate introduction, and finally **persists those wishes** to fuel "popular brand" recommendations.

In other words — **this product grows with its users. The more it's used, the better it understands what kids want to learn.** That's a data asset.

---

## Slide 11 · Responsive & Inclusive (30s)

Finally, the product adapts across **PC, iPad, and mobile:** five to six columns on desktop, three to four on tablet, two on phones. Mobile gets safe-area insets, forty-four-pixel tap targets, iOS focus-zoom prevention, and aria labels for accessibility.

Whatever screen a family owns, the experience is smooth.

---

## Slide 12 · Business Model (1.5 min · core for AI4BIZ)

*slow down here — this is what AI4BIZ judges care about most*

Now, the business model — AI for Business demands a real revenue path, and we have **four lines:**

1. **B2C family subscription:** free trial plus paid unlocks of premium brands, unlimited exploration, and advanced bilingual content. Parents pay; kids benefit.
2. **B2B school licensing:** financial-literacy course packs, a teacher dashboard, and classroom casting — into public, international, and after-school programs.
3. **Brand partnerships and IP:** featured brands can build official deep-dive pages and campaigns, creating a positive flywheel.
4. **Data assets:** the kids' interest data I mentioned is an early-mover moat that only gets harder to catch.

On costs: **content is generated by AI plus templates, storage runs on Serverless, so the bigger we scale, the lower the unit cost.** That's the foundation that makes the unit economics work.

---

## Slide 13 · Market & Impact (1 min)

Why now?

First, demand for kids' financial and business literacy is growing fast, driven by both policy and parents. Second, children's audio and podcast content is booming — "listening" fits ages six to fourteen far better than "reading." And third, most importantly — **generative AI makes "an instant explainer for any brand" economically viable for the first time.** These three trends converge right now.

On the right is the competitive picture: kid-first language, dual-voice podcast, instant any-brand generation, a six-dimension business frame, and a zero-key demo. Each is unique to us. We haven't found a direct competitor in this niche.

---

## Slide 14 · Roadmap (45s)

Our roadmap is clear:

- **Now:** the MVP is shipped — thirty-one brands, bilingual, every device, zero-key runnable.
- **Three months:** switch on ElevenLabs, DALL·E, and the LLM for real, plus user accounts.
- **Six months:** launch the B2B course pack and teacher dashboard, start school pilots.
- **Twelve months:** go multilingual — English, Japanese, Korean — with brand partnerships and subscription revenue, toward a platform.

Because marginal content cost trends to zero, scaling from one hundred to ten thousand brands is **linear.**

---

## Slide 15 · Innovation Recap (1 min)

To close, three sentences on why it's BrandPedia Kids:

1. **Education-first AI** — we don't hand AI to kids; we use AI to translate the complex business world into stories they understand, remember, and can be tested on. Safe, fun, and educational.
2. **Out-of-the-box architecture** — zero keys to demo, seamless real AI in production. Judges experience the whole product today.
3. **A clear business path** — three revenue lines with marginal cost trending to zero. A genuine, AI4BIZ-grade commercial story.

> **One-line vision: every kid, aged six to fourteen, finally understands the world around them — through stories.**

---

## Slide 16 · Close (30s)

Thank you, everyone.

We can run a **live demo right now** — it's zero-setup, just `npm run dev`. We'd love to take your questions.

Thank you!

---

## Appendix · Anticipated Q&A

> Not part of the spoken talk — prep for the Q&A.

1. **Why podcast instead of video?**
   "Listening" is lower-friction and fits the fragmented attention of ages 6–14; audio is cheap to produce and transmit, which helps us scale; and it avoids visual overload, which parents prefer for kids' content.

2. **Is offline (no-key) content good enough?**
   Yes — it's complete and educationally accurate: thirty-one hand-verified brands, de-duplicated six-dimension templates, and zero wrong quiz answers. Real LLMs make it richer, not viable.

3. **What if a kid types an inappropriate brand?**
   The generation layer constrains category and content scope, and the survey is structured by category. Post-launch we'll add child-safety review and a whitelist.

4. **How do you handle children's data privacy?**
   Today we log only anonymous wishes and category preferences — no personal identity. In B2B school contexts we follow school and parental consent, aligned with COPPA / GDPR-K principles.

5. **What's the moat if a big company copies you?**
   The moat is the combination — kid-first content, dual-voice script engineering, the six-dimension framework, and an interest data flywheel. It's not any single feature, and the data flywheel is hardest to catch the later you start.

6. **How big is the market?**
   Two growing markets overlap: K-12 extracurricular and financial literacy, plus global children's audio/education content. B2C subscription plus B2B licensing is a proven monetization model in both.

7. **How is the content generated — and is it accurate?**
   Preset brands are hand-verified. Custom brands go through the same structured six-dimension template generator (or a real LLM when keys are present), with quiz distractors pulled from real cross-brand data and fully correctness-checked.

---

*(End of speaker script · pairs with `BrandPedia-Kids-Slides.html` and `BrandPedia-Kids.pptx`)*
