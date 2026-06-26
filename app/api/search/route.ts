import { NextResponse } from "next/server";
import { getStore } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();

  const all = await getStore().listBrands();
  if (!q) {
    return NextResponse.json({ results: [], query: "" });
  }

  const results = all
    .filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.nameEn.toLowerCase().includes(q) ||
        b.slug.includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.slogan.toLowerCase().includes(q),
    )
    .sort((a, b) => {
      // exact / prefix matches first, then featured
      const sa = (a.name.toLowerCase() === q ? 0 : a.name.toLowerCase().startsWith(q) ? 1 : 2);
      const sb = (b.name.toLowerCase() === q ? 0 : b.name.toLowerCase().startsWith(q) ? 1 : 2);
      if (sa !== sb) return sa - sb;
      return Number(b.featured ?? false) - Number(a.featured ?? false);
    })
    .slice(0, 8);

  return NextResponse.json({ results, query: q });
}
