# Test Checklist · BrandPedia Kids

An end-to-end manual test checklist. Each item lists the verification step and expected result. Run through it after development / deployment.

---

## A. Environment & startup

- [ ] `npm install` completes without errors.
- [ ] `npm run build` succeeds with no TypeScript errors.
- [ ] `npm run dev` starts and `http://localhost:3000` returns 200.
- [ ] Runs fully **without an API key** (browser speech + local JSON + template generation).

## B. Home · Brand Logo Wall

- [ ] The home page renders 31 brand logo cards.
- [ ] Curated brands (Coca-Cola, Disney, Apple, Nike, McDonald's, LEGO, Starbucks, Tesla) appear first and carry a ⭐ badge.
- [ ] **Category filter**: clicking "Technology", "Sports", etc. shows only that category; "All" restores the full grid.
- [ ] **Logo card hover**: the card enlarges slightly, the logo wobbles, and the slogan appears.
- [ ] **Logo card click**: flips to the back showing a fun fact, then (~1.3s later) navigates to that brand's detail page.
- [ ] **Search box**: typing "coca" or "apple" shows a suggestion dropdown; clicking a suggestion navigates; typing an uncatalogued term shows "✨ Explore new brand: xxx".
- [ ] The top **language toggle** switches the UI between Chinese / English.
- [ ] The bottom "Explore new brand" banner button navigates to `/explore`.

## C. Brand detail page

- [ ] The hero shows the logo, brand name, slogan, year/founder/country, and a curated or AI-generated badge.
- [ ] **Podcast + card area**: card flow on the left (switch with arrows or click dots), description + two-host intro + "▶ Start podcast" button on the right.
- [ ] Clicking "Start podcast": browser speech begins, with the two hosts (different voices) alternating.
- [ ] **Card sync**: when narration reaches a segment bound to a card, the left card flow flips to that card and highlights it.
- [ ] **Mini Player (bottom, fixed)**:
  - Shows the brand logo, the current host (🦊 / 🐰) and their line.
  - Play / pause toggles correctly.
  - The progress bar is draggable (jumps to the nearest segment); ⏪/⏩ ±10s.
  - **Speed** cycles 0.8x / 1x / 1.2x and the speech rate changes accordingly.
- [ ] **Knowledge dimensions**: all 6 dimension cards render with text + keyPoints.
- [ ] **Knowledge quiz**: answer each question; correct/incorrect shows feedback and an explanation; after the last question, a score and "Play again" appear. Question types, wording, and distractors should differ per brand (no repetition).
- [ ] **Related brands**: 4 related brands (same category / curated) appear at the bottom; clicking navigates.
- [ ] The "back to home" link works.

## C2. Kid survey (/survey)

- [ ] The 3-step survey completes: pick category → pick story type → type the brand you want to learn.
- [ ] Typing a catalogued brand (e.g. "Coca-Cola") → the result page shows "Found it!" and navigates to that brand (accurate intro).
- [ ] Typing an uncatalogued brand (e.g. "Paw Patrol") → shows "Not yet catalogued" + "Let AI build it for me", navigating to `/explore?q=...`.
- [ ] The result page recommends brands by the chosen category and shows "Other kids also want to learn" popular wishes.
- [ ] `data/wishlist.json` records the wish; `GET /api/wishlist` returns the popular list.
- [ ] Each step supports "Skip" / "Back"; the result page supports "Answer again".

## D. Explore new brand

- [ ] `/explore` shows the input box and intro.
- [ ] Typing "Mixue" and starting shows the **robot-flipping-through-a-book loading animation** + progress bar (0→100%).
- [ ] Progress text changes by stage (gathering info → writing script → making cards → done).
- [ ] On completion it auto-navigates (or via "Take a look") to `/generated/<slug>`.
- [ ] The generated page has complete content: 6 dimensions, cards, podcast script, quiz.
- [ ] Entering `/explore` with a `?q=` from the search box auto-starts generation.
- [ ] `data/brands.json` gains a record for the brand; `data/search-history.json` gains a search record.
- [ ] (Optional) With `OPENAI_API_KEY` set, the generated content is noticeably richer and more brand-specific.

## E. API endpoints

- [ ] `GET /api/search?q=coca` returns matching brands.
- [ ] `GET /api/brands?category=technology` returns technology brands.
- [ ] `GET /api/brands/coca-cola` returns a complete `BrandContent` (6 sections / 6 cards / 14 segments / 4 quiz).
- [ ] `POST /api/generate` `{name}` returns an SSE stream pushing started → generating_content → generating_script → generating_cards → completed (with slug).
- [ ] `GET /api/tts?slug=coca-cola` returns `{"mode":"web"}` when no key is set.

## F. Bilingual

- [ ] After toggling language site-wide: home copy, hero, category names, buttons, and card titles all change.
- [ ] Brand names / taglines / slogans switch between languages.
- [ ] The language preference persists across refresh (localStorage).

## G. Compatibility & accessibility

- [ ] Works on Chrome / Edge / Safari / Firefox desktop.
- [ ] Mobile (narrow) layout adapts: the grid becomes 2 columns and the Mini Player's progress bar wraps.
- [ ] Keyboard accessible: main buttons can be focused with Tab and triggered with Enter.
- [ ] Color contrast is readable (body text is dark `#2b2a4c`).

## H. Performance

- [ ] Home first paint < 3s (local).
- [ ] Brand detail page < 1s.
- [ ] Search dropdown < 500ms (including 250ms debounce).
- [ ] Explore generation ~4–6s in demo mode (with animation); real LLM depends on the model.

## I. Offline / fallback

- [ ] No `OPENAI_API_KEY`: explore uses the template generator; content is complete and usable.
- [ ] No TTS key: the podcast uses Web Speech and works (no true seek; progress is estimated from word count).
- [ ] No Supabase: local JSON storage; generated content persists locally.

## J. Known limitations

- The Web Speech API can't seek to arbitrary positions, so scrubbing "jumps to the nearest segment" rather than an exact point; with real TTS you can pre-synthesize audio for precise seeking.
- Available `speechSynthesis` voices vary by OS/browser; if a male+female voice pair can't be found, it falls back to any two distinct voices distinguished by pitch.
- Serverless (Vercel) filesystems are read-only, so Supabase must be enabled to persist generated content.
