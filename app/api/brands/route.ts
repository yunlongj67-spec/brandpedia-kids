import { NextResponse } from "next/server";
import { getStore } from "@/lib/storage";
import type { Category } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category") as Category | "all" | null;
  let brands = await getStore().listBrands();
  if (category && category !== "all") {
    brands = brands.filter((b) => b.category === category);
  }
  brands = [...brands].sort(
    (a, b) => Number(b.featured ?? false) - Number(a.featured ?? false),
  );
  return NextResponse.json({ brands });
}
