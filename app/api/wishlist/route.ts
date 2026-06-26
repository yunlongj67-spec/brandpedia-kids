import { NextResponse } from "next/server";
import { getStore } from "@/lib/storage";
import type { Category, Dimension, WishlistEntry } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const popular = await getStore().popularWishes(10);
  return NextResponse.json({ wishes: popular });
}

export async function POST(req: Request) {
  let body: { wish?: string; category?: Category | null; dimension?: Dimension | null } = {};
  try {
    body = await req.json();
  } catch {
    /* empty */
  }
  const wish = (body.wish ?? "").toString().trim();
  if (!wish) {
    return NextResponse.json({ error: "wish required" }, { status: 400 });
  }
  const entry: WishlistEntry = {
    id: `wish-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    wish,
    category: body.category ?? null,
    dimension: body.dimension ?? null,
    ts: Date.now(),
  };
  await getStore().recordWish(entry);
  return NextResponse.json({ ok: true });
}
