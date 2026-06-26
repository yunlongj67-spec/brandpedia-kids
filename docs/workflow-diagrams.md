# BrandPedia Kids — Workflow Diagrams

Visual diagrams for the product, the AI generation pipeline, and the system architecture. All diagrams are written in **[Mermaid](https://mermaid.js.org/)** so they render inline on GitHub, VS Code, Typora, and most Markdown viewers, and can be exported to PNG/SVG.

> **To export an image:** paste any diagram block into <https://mermaid.live>, or run `npx mmdc -i input.mmd -o diagram.png` (requires `@mermaid-js/mermaid-cli`).

---

## 1. Product Flow (the child's journey)

This is the end-to-end experience a kid has on the site — from landing on the Logo Wall, into a brand's podcast, through the quiz, and into exploring a brand of their own choice. The learning loop intentionally brings them back to browse again.

```mermaid
flowchart TD
    Home["🏠 Home — Logo Wall<br/>30+ brands, category filter, search"]
    Card["🃏 Brand Card<br/>hover = slogan · click = flip → fun fact"]
    Detail["🎙️ Brand Detail Page<br/>hero + dual-host podcast + synced cards"]
    Listen["🎧 Play Podcast<br/>cards auto-highlight in sync with audio<br/>speed 0.8 / 1 / 1.2× · seek by segment"]
    Sections["📚 6 Knowledge Dimensions<br/>Story · Product · Money · Marketing · Competition · Data"]
    Quiz["🧠 Quiz<br/>7 question types · cross-brand distractors · score"]
    Survey["📝 Kid Survey<br/>category → story type → brand I want"]
    Explore["🤖 Explore a New Brand<br/>type any name → AI generates it"]
    Generated["✨ Generated Brand Page<br/>full 6-dimension content"]
    Back["↻ Back to browsing<br/>(wishlist fuels recommendations)"]

    Home --> Card --> Detail
    Detail --> Listen --> Sections --> Quiz
    Detail --> Back
    Quiz --> Back
    Home -->|top nav| Survey
    Home -->|top nav / search miss| Explore
    Survey -->|"already catalogued"| Detail
    Survey -->|"not yet → AI makes it"| Explore
    Explore --> Generated --> Detail
    Back --> Home
```

**Key mechanism — podcast ↔ card sync:** every podcast segment carries a `cardId`. While a segment plays, its card highlights and scrolls into view, so *what the child hears is what they see* — multimodal learning that is far more memorable than audio or text alone.

---

## 2. AI Generation Flow ("Explore a new brand")

When a child types a brand that is not in the catalog, the backend generates a complete, structured learning bundle and streams progress to the browser in real time via **Server-Sent Events (SSE)**. The same pipeline runs the preset brands; the only difference is the brand metadata source.

```mermaid
flowchart TD
    Input["⌨️ Child types a brand name<br/>(e.g. 'Mixue', 'Paw Patrol')"]
    Post["POST /api/generate { name }"]
    SSE["Open SSE stream to browser<br/>robot-loading animation shows live progress"]

    subgraph Backend["Backend (Next.js Route Handler)"]
        Synth["synthesizeBrand(name)<br/>→ slug, category, emoji, color, key facts"]
        Decide{"LLM key<br/>configured?"}
        LLM["LLM adapter<br/>real model writes 6-dim content"]
        Template["Template generator<br/>offline fallback builds content"]
        Build["generateContent(brand)<br/>6 sections · dual-host script · 4 card types · quiz"]
        Deterministic["Deterministic FNV seed<br/>(stable, SSR-safe content)"]
        Store["Store brand<br/>JSON file (dev) or Supabase (prod)"]
        History["Record search history<br/>+ kid wishlist"]
    end

    Done["completed { slug }"]
    Redirect["Redirect → /generated/[slug]<br/>full brand detail page"]

    Input --> Post --> SSE --> Synth
    Synth --> Decide
    Decide -->|yes| LLM --> Build
    Decide -->|no| Template --> Build
    Build --> Deterministic --> Store --> History --> Done --> Redirect

    SSE -.->|"started (5%)"| Backend
    SSE -.->|"generating_content (25%)"| Build
    SSE -.->|"generating_script (55%)"| Build
    SSE -.->|"generating_cards (80%)"| Build
    SSE -.->|"completed (100%)"| Done
```

**Why this matters:** a single typed brand becomes a *complete lesson* (story, money logic, marketing, quiz, animated chart, timeline) in seconds — the marginal cost of a new brand is near zero, and the child's wishes directly shape what gets built next (the data flywheel).

---

## 3. System Architecture

A clean, four-layer architecture. The defining decision is the **adapter pattern**: each AI/storage capability has a real-service implementation *and* a local fallback, selected by environment variables. The result is a product that runs fully with **zero API keys** and upgrades to enterprise-grade AI with **no code change**.

```mermaid
flowchart TB
    subgraph Client["Client UI  (browser)"]
        UI["Next.js 16 App Router · React 19<br/>TypeScript · Tailwind v4 · Framer Motion<br/>Web Speech playback engine · podcast↔card sync"]
    end

    subgraph API["API Layer  (Next.js Route Handlers)"]
        R1["/api/brands<br/>/api/brands/[slug]"]
        R2["/api/search"]
        R3["/api/generate  (SSE)"]
        R4["/api/tts"]
        R5["/api/wishlist"]
    end

    subgraph Adapters["AI Adapter Layer  (env-gated, one interface each)"]
        A1["LLM · OpenAI-compatible"]
        A2["TTS · ElevenLabs / Azure"]
        A3["Image · DALL·E"]
        A4["Storage · Supabase"]
    end

    subgraph Fallback["Local Fallback  (zero-key runtime)"]
        F1["Web Speech API<br/>dual-voice podcast"]
        F2["SVG / Emoji<br/>charts & illustrations"]
        F3["Template generator<br/>6-dimension content"]
        F4["Local JSON files<br/>data/*.json"]
    end

    UI --> API
    API --> Adapters
    Adapters -->|"key present"| Real["Real cloud services"]
    Adapters -->|"no key"| Fallback
    Fallback --> UI
```

### How a request flows
1. **Client** renders the page and plays audio via the Web Speech engine (or pre-synthesized audio when a TTS key exists).
2. **API routes** serve brand data, search, the SSE generate stream, TTS lookups, and the wishlist.
3. **Adapters** route each capability to a real service *if the matching env key is set*, otherwise transparently to the **local fallback**.
4. **Fallbacks** keep the product 100% functional offline — the same experience judges get with zero setup.

### Adapter cheat-sheet

| Capability | Real service (env key) | Local fallback (no key) |
| --- | --- | --- |
| Content / script writing | `OPENAI_API_KEY` → OpenAI LLM | Template generator |
| Podcast voices | `ELEVENLABS_API_KEY` / `AZURE_SPEECH_KEY` | Browser Web Speech API (dual voices) |
| Brand illustrations | `OPENAI_API_KEY` → DALL·E | SVG / Emoji |
| Persistence | `USE_SUPABASE` + Supabase creds | Local `data/*.json` |

> **Bottom line:** zero-config demo today → production-grade AI tomorrow, with **zero code migration**. That is the architectural decision that makes BrandPedia Kids simultaneously the most demoable and the most scalable product in the track.
