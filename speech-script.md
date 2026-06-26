# BrandPedia Kids — Speaker Script

**Event:** IAI²O 2026 — International AI Innovation Olympiad · **Track:** AI for Business (AI4BIZ)
**Project:** BrandPedia Kids · AI-driven children's business encyclopedia
**Companion deck:** `BrandPedia-Kids-Slides.html` / `BrandPedia-Kids.pptx` (**9 slides**)
**Target length:** ~10–12 minutes

> How to use: each section maps to one slide in the order of the deck. `[…]` marks timing cues. Read naturally — this is a guide, not a verbatim script.

---

## Slide 1 · Title (20s)

Good morning, judges. We're **Team BrandPedia Kids**. In one line: we turn the brands kids already love into **AI-generated business lessons** — a podcast, illustrated cards, and a quiz, for any brand, in seconds. Here's how AI does it, and how it becomes a real business.

---

## Slide 2 · The Problem (50s)

Kids meet hundreds of brands every day — a Coke, a sneaker, a phone, a theme park — but understand zero business. The data is striking: only **one in three adults worldwide is financially literate** — that's the lifelong cost of never learning early. And financial education typically starts at fifteen-plus, *after* the six-to-fourteen habit-formation window has already closed. Meanwhile kids influence over **five hundred billion dollars** a year in family spending, yet learn nothing about how any of it works.

And the path they try today is broken: a kid wonders why Coke is cheap, Googles it, lands on adult Wikipedia — dry, full of jargon — and gives up. There is simply no path built for a ten-year-old. That gap is our opportunity.

---

## Slide 3 · The AI Solution (40s)

Our solution is the simplest possible framing: **a child inputs any brand → our AI generates a full lesson → out comes a three-to-five-minute dual-host podcast, illustrated cards that sync to the audio, and a quiz** — all across six business dimensions. Two AI hosts, a fox and a rabbit, explain the brand like a conversation. Curiosity to comprehension, in seconds, for *any* brand.

---

## Slide 4 · Competitive Value Curve ★ (45s)

This is mandatory slide one. Versus the status quo — YouTube and Wikipedia — and traditional tutoring or books, we score **higher and broader** across every factor that matters to a kid: speed, cost-efficiency, reliability, kid-fit, coverage of any brand, and engagement. We match on cost, trail only slightly on raw reliability because content is AI-generated, and win decisively on kid-fit, coverage, and engagement. This is a Blue-Ocean-style value curve — we don't compete on the same axes; we create new value the alternatives can't offer.

---

## Slide 5 · AI System Architecture ★ (50s)

Mandatory slide two — how AI does the work. **Inputs:** the brand name a child types, our curated metadata (founder, year, country, facts), and the kid's wishlist. **Processing:** a large language model writes the six-dimension script, a TTS model brings it to life with two distinct voices, an image-and-chart model designs the visuals, and an assembler builds the cards and quiz using deterministic seeding — so it's stable and reproducible. **Outputs:** the podcast, synced cards, and quiz — and the wishlist feeds back as data, training our recommendations.

Every stage has an offline fallback, so the entire pipeline runs with **zero API keys** and upgrades to real LLM, TTS, and image models the moment you add one environment variable.

---

## Slide 6 · Market Size (40s)

Three growing markets converge on us. **TAM:** global K-12 supplemental education plus children's audio and edutainment — on the order of three hundred billion dollars, per HolonIQ's edtech tracking. **SAM:** English and Chinese-speaking families and schools seeking business literacy for six-to-fourteen-year-olds — a ten-to-twenty-billion slice. **SOM:** in three years, a single-digit-percent share via B2C subscriptions and the first B2B school pilots — roughly thirty to sixty million dollars obtainable. These are order-of-magnitude estimates tied to public report categories; we don't invent figures.

---

## Slide 7 · Go-to-Market Strategy (40s)

We start with **product-led growth**: the free "explore any brand" feature is our viral hook — kids share the brands they generate, and parents convert to paid. Then **parent communities and education creators** drive low-CAC B2C signups. Then **B2B school pilots** — a course pack plus teacher dashboard, landing three to five pilot schools before expanding district-wide. **Brand partnerships** come last, once traction is visible. This is solo-founder friendly: product-led growth front-loads organic growth before any enterprise sales motion.

---

## Slide 8 · Financial Projections (45s)

Here's the three-year forecast, with AI and API costs broken out explicitly. Revenue grows from two-twenty thousand in year one, to one-point-seven million, to seven-point-one million across B2C subscriptions, B2B licensing, and brand partnerships. On the cost side, our **AI and API spend** — roughly five cents per generated lesson across the LLM, TTS, and image calls — scales from thirty thousand to six hundred thousand as usage grows. Because content is generated rather than hand-produced, the marginal cost of the next brand trends to zero, gross margin improves with scale, and we **break even mid-year two**.

---

## Slide 9 · The Ask (25s)

To reach a hundred thousand kids, we're asking for about **eighty thousand dollars**: twenty-five thousand in API and compute credits, fifteen thousand to onboard three pilot schools, and forty thousand for six months of founder runway — plus warm introductions to schools and brand partners and ongoing mentorship from this panel. With that, we ship the teacher dashboard and a multilingual launch.

BrandPedia Kids gives the next generation an intuitive grip on the business world — before they form their consumer habits. Through stories, in their language, built end-to-end with AI. Thank you.

---

## Anticipated Q&A

- **"Why a podcast, not video?"** Audio fits ages 6–14 better than reading; it's screen-light and cheap to produce. Paired with synced cards it's multimodal — far more memorable than audio alone, at a fraction of video cost.
- **"How do you avoid hallucination?"** Preset brands use hand-verified metadata; generated content is template-grounded; quizzes are correctness-checked with distractors from real cross-brand data — zero wrong answers today.
- **"Isn't this a ChatGPT wrapper?"** No — it's a structured product: a six-dimension schema, deterministic generation, podcast↔card sync, a quiz engine, bilingual content, and an offline-capable architecture. The LLM is one adapter among four.
- **"How big can this get?"** Because marginal content cost trends to zero, scaling from 100 to 10,000 brands is linear — and the same engine can later explain products, careers, or current events.
- **"What's the moat?"** The combination — kid-first content, dual-voice sync, the 6-dimension framework — plus an interest-data flywheel that compounds with every child who uses it.

*(Fuller Q&A in `docs/defense-qa.md`.)*
