// BrandPedia Kids — storage layer.
// Default: local JSON files under data/ (works with zero setup, dev/Node only).
// When USE_SUPABASE=true + SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY are set, a
// REST-based Supabase adapter is used instead (no SDK dependency needed).
//
// Server-only: uses fs and process.env. Import only from API routes / server components.

import { promises as fs } from "fs";
import path from "path";
import type { Brand, BrandContent, SearchHistoryEntry, WishlistEntry } from "./types";
import { BRANDS, getBrandBySlug } from "./brands";
import { generateContent } from "./contentTemplates";

const DATA_DIR = path.join(process.cwd(), "data");
const BRANDS_FILE = path.join(DATA_DIR, "brands.json");
const HISTORY_FILE = path.join(DATA_DIR, "search-history.json");
const WISHLIST_FILE = path.join(DATA_DIR, "wishlist.json");

export interface StorageAdapter {
  listBrands(): Promise<Brand[]>;
  getBrandContent(slug: string): Promise<BrandContent | null>;
  saveGenerated(content: BrandContent): Promise<BrandContent>;
  recordSearch(entry: SearchHistoryEntry): Promise<void>;
  popularSearches(limit?: number): Promise<{ query: string; count: number }[]>;
  recordWish(entry: WishlistEntry): Promise<void>;
  popularWishes(limit?: number): Promise<{ wish: string; count: number }[]>;
}

// ───────────────────────── JSON store ─────────────────────────

interface StoredDoc {
  brands: Record<string, BrandContent>; // keyed by slug
}

interface HistoryDoc {
  entries: SearchHistoryEntry[];
}

interface WishlistDoc {
  entries: WishlistEntry[];
}

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJSON<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJSON(file: string, data: unknown) {
  await ensureDataDir();
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}

export class JSONStore implements StorageAdapter {
  async listBrands(): Promise<Brand[]> {
    const doc = await readJSON<StoredDoc>(BRANDS_FILE, { brands: {} });
    const generated = Object.values(doc.brands).map((c) => c.brand);
    return [...BRANDS, ...generated];
  }

  async getBrandContent(slug: string): Promise<BrandContent | null> {
    // generated brand?
    const doc = await readJSON<StoredDoc>(BRANDS_FILE, { brands: {} });
    if (doc.brands[slug]) return doc.brands[slug];
    // preset brand → generate deterministically
    const brand = getBrandBySlug(slug);
    if (!brand) return null;
    return generateContent(brand);
  }

  async saveGenerated(content: BrandContent): Promise<BrandContent> {
    const doc = await readJSON<StoredDoc>(BRANDS_FILE, { brands: {} });
    doc.brands[content.brand.slug] = content;
    await writeJSON(BRANDS_FILE, doc);
    return content;
  }

  async recordSearch(entry: SearchHistoryEntry): Promise<void> {
    const doc = await readJSON<HistoryDoc>(HISTORY_FILE, { entries: [] });
    doc.entries.unshift(entry);
    doc.entries = doc.entries.slice(0, 500); // cap
    await writeJSON(HISTORY_FILE, doc);
  }

  async popularSearches(limit = 8): Promise<{ query: string; count: number }[]> {
    const doc = await readJSON<HistoryDoc>(HISTORY_FILE, { entries: [] });
    const counts = new Map<string, number>();
    for (const e of doc.entries) {
      const q = e.query.trim();
      if (!q) continue;
      counts.set(q, (counts.get(q) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async recordWish(entry: WishlistEntry): Promise<void> {
    const doc = await readJSON<WishlistDoc>(WISHLIST_FILE, { entries: [] });
    doc.entries.unshift(entry);
    doc.entries = doc.entries.slice(0, 500);
    await writeJSON(WISHLIST_FILE, doc);
  }

  async popularWishes(limit = 8): Promise<{ wish: string; count: number }[]> {
    const doc = await readJSON<WishlistDoc>(WISHLIST_FILE, { entries: [] });
    const counts = new Map<string, number>();
    for (const e of doc.entries) {
      const w = e.wish.trim();
      if (!w) continue;
      counts.set(w, (counts.get(w) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([wish, count]) => ({ wish, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}

// ───────────────────────── Supabase store (REST, no SDK) ─────────────────────────

export class SupabaseStore implements StorageAdapter {
  private url: string;
  private key: string;
  private headers: Record<string, string>;

  constructor() {
    this.url = (process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
    this.key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
    this.headers = {
      apikey: this.key,
      Authorization: `Bearer ${this.key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    };
  }

  private async req(pathSeg: string, opts: RequestInit = {}) {
    const res = await fetch(`${this.url}/rest/v1${pathSeg}`, {
      ...opts,
      headers: { ...this.headers, ...(opts.headers ?? {}) },
    });
    if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
    return res;
  }

  async listBrands(): Promise<Brand[]> {
    const res = await this.req("/brands?select=brand");
    const rows: { brand: Brand }[] = await res.json();
    const generated = rows.map((r) => r.brand);
    return [...BRANDS, ...generated];
  }

  async getBrandContent(slug: string): Promise<BrandContent | null> {
    const res = await this.req(
      `/brands?slug=eq.${encodeURIComponent(slug)}&select=content`,
    );
    const rows: { content: BrandContent }[] = await res.json();
    if (rows.length) return rows[0].content;
    const brand = getBrandBySlug(slug);
    return brand ? generateContent(brand) : null;
  }

  async saveGenerated(content: BrandContent): Promise<BrandContent> {
    await this.req("/brands", {
      method: "POST",
      body: JSON.stringify({
        slug: content.brand.slug,
        brand: content.brand,
        content,
      }),
    });
    return content;
  }

  async recordSearch(entry: SearchHistoryEntry): Promise<void> {
    await this.req("/search_history", {
      method: "POST",
      body: JSON.stringify(entry),
    });
  }

  async popularSearches(limit = 8): Promise<{ query: string; count: number }[]> {
    const res = await this.req(`/search_history?select=query&limit=200`);
    const rows: { query: string }[] = await res.json();
    const counts = new Map<string, number>();
    for (const r of rows) counts.set(r.query, (counts.get(r.query) ?? 0) + 1);
    return [...counts.entries()]
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async recordWish(entry: WishlistEntry): Promise<void> {
    await this.req("/wishes", { method: "POST", body: JSON.stringify(entry) });
  }

  async popularWishes(limit = 8): Promise<{ wish: string; count: number }[]> {
    const res = await this.req(`/wishes?select=wish&limit=200`);
    const rows: { wish: string }[] = await res.json();
    const counts = new Map<string, number>();
    for (const r of rows) counts.set(r.wish, (counts.get(r.wish) ?? 0) + 1);
    return [...counts.entries()]
      .map(([wish, count]) => ({ wish, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}

// ───────────────────────── factory ─────────────────────────

let cached: StorageAdapter | null = null;

export function getStore(): StorageAdapter {
  if (cached) return cached;
  const useSupabase =
    process.env.USE_SUPABASE === "true" &&
    !!process.env.SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  cached = useSupabase ? new SupabaseStore() : new JSONStore();
  return cached;
}
