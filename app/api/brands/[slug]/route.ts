import { NextResponse } from "next/server";
import { getStore } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteCtx {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: Request, ctx: RouteCtx) {
  const { slug } = await ctx.params;
  const content = await getStore().getBrandContent(slug);
  if (!content) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(content);
}
