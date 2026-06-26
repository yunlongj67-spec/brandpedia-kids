# Installation & Deployment Guide · BrandPedia Kids

A step-by-step walkthrough of local development, building, and deploying to Vercel / a self-hosted server.

---

## 1. Prerequisites

| Dependency | Version | Notes |
| --- | --- | --- |
| Node.js | ≥ 18.18 (20+ recommended; built on 26) | JavaScript runtime |
| npm | ≥ 10 (built on 11) | Ships with Node |
| OS | macOS / Linux / Windows | — |

> No Docker, database, or API key is required to start. Every external service (LLM / TTS / image / Supabase) is **optional**.

## 2. Local install

```bash
# from the project directory
cd BrandPedia

# install dependencies
npm install
```

Dependencies (`package.json`): `next`, `react`, `react-dom`, `tailwindcss`, `framer-motion`, `clsx`, `lucide-react`, `typescript`.

## 3. Environment variables (optional)

```bash
cp .env.example .env.local
```

Fill in as needed (see comments in `.env.example`):

- `OPENAI_API_KEY` (+ optional `OPENAI_BASE_URL` / `OPENAI_MODEL`): "Explore new brand" uses a real LLM for richer content.
- `ELEVENLABS_API_KEY` or `AZURE_SPEECH_KEY`+`AZURE_SPEECH_REGION`: high-quality podcast voices.
- `USE_SUPABASE=true` + `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`: cloud storage (recommended for Serverless).

> **It runs without any of these**: the podcast uses the browser Web Speech API, images use emoji/SVG, storage uses local `data/*.json`, and generation uses local templates.

## 4. Development & build

```bash
npm run dev      # dev server → http://localhost:3000
npm run build    # production build
npm run start    # run the production server
```

### Starting & stopping the server (open / close)

Always **open** and **close** the server cleanly so no `next` process is left running in the background.

**Start (open) the dev server**
```bash
npm run dev      # → http://localhost:3000
```
Keep that terminal open while you work; the server hot-reloads on file changes.

**Stop (close) the dev server**
- In the terminal where it is running, press `Ctrl + C`.
- Stop it with `Ctrl + C` **before** closing the terminal or starting another server. If you just close the terminal window, the `next` process can keep running in the background and hold port 3000 — which causes the blank-page / dead-buttons issue below.

**If port 3000 is in use, or the page loads blank and buttons stop responding**
A previous `next` process did not shut down. Kill it, then start one fresh server:
```bash
# macOS / Linux — kill whatever is holding port 3000 (or any stray next process)
lsof -ti:3000 | xargs kill -9      # alternative:  pkill -f next

npm run dev                       # then start one clean server
```
> Symptom: the header renders but the page body is blank and nothing is clickable. This is a **hung or duplicate dev server, not a code bug**. A clean restart plus a hard refresh in the browser (`Cmd/Ctrl + Shift + R`) fixes it.

**Production server (open / close)**
```bash
npm run build && npm run start     # open (default port 3000)
# Ctrl + C in that terminal to close it
# custom port: PORT=8080 npm run start
```

### Local data

- `data/brands.json`: AI-generated brand content (keyed by slug).
- `data/search-history.json`: user search history (used for popular recommendations).

Both files are written automatically the first time you generate a brand or search. To reset, just delete them (the app rebuilds them on demand).

---

## 5. Deploy to Vercel (recommended)

1. Push the code to GitHub.
2. Import the repository on [vercel.com](https://vercel.com).
3. The framework preset is auto-detected as **Next.js**.
4. Under **Settings → Environment Variables**, add `OPENAI_API_KEY` etc. as needed.
5. ⚠️ **Important**: Serverless platforms like Vercel have a read-only filesystem, so local JSON storage won't work in production. Enable Supabase for production:
   - `USE_SUPABASE=true`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - Create the tables in Supabase:
     ```sql
     create table brands (
       slug text primary key,
       brand jsonb,
       content jsonb
     );
     create table search_history (
       id text primary key,
       query text,
       ts bigint,
       result text,
       brand_slug text
     );
     create table wishes (
       id text primary key,
       wish text,
       category text,
       dimension text,
       ts bigint
     );
     ```
6. Deploy.

## 6. Self-hosted server / Docker

```bash
npm run build
npm run start    # listens on port 3000 by default
# custom port: PORT=8080 npm run start
```

You can guard the process with PM2 / systemd and put Nginx in front as a reverse proxy. A self-hosted server has a writable filesystem, so local JSON storage works directly.

Example Dockerfile (if you want to containerize):

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "start"]
```

> For containerized deployments that need to persist generated content, mount a `/app/data` volume, or switch to Supabase.

---

## 7. FAQ

**Q: No audio from the podcast?**
A: By default it uses the browser Web Speech API. Make sure the browser allows audio, the system isn't muted, and — for some browsers — that you've interacted with the page (clicked play) first. Chrome/Edge have good voice support.

**Q: The "Explore new brand" content feels generic?**
A: Without `OPENAI_API_KEY` it uses the local template generator, which is more generic. Add a key and it uses a real LLM for richer, brand-specific content.

**Q: I can generate brands locally, but they vanish after refreshing on Vercel?**
A: Serverless filesystems are read-only. Enable Supabase storage (see step 5).

**Q: How do I reset all generated content?**
A: Locally, delete `data/brands.json` and `data/search-history.json`; in Supabase mode, clear the corresponding tables.

**Q: The page loads blank and the header buttons don't respond.**
A: A dev server is probably hung or duplicated. Stop all servers (`Ctrl + C`, then `pkill -f next`), start one with `npm run dev`, and hard-refresh the browser (`Cmd/Ctrl + Shift + R`). See *Starting & stopping the server* above.

**Q: How do I open the site from my phone / iPad on the same Wi-Fi?**
A: The dev server is reachable on your LAN at the **Network** URL Next.js prints on startup (e.g. `http://192.168.x.x:3000`). Open that URL in the other device's browser. Both devices must be on the same network. If it won't load, start the server bound to all interfaces: `npm run dev -- -H 0.0.0.0`.
