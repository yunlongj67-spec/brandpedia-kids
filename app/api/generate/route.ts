import { generateBrandContent } from "@/lib/ai/llm";
import { getStore } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: Request) {
  let name = "";
  try {
    const body = await req.json();
    name = (body?.name ?? "").toString().trim();
  } catch {
    name = "";
  }
  if (!name) {
    return new Response(JSON.stringify({ error: "name required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (obj: Record<string, unknown>) =>
        controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));

      try {
        send({ status: "started", progress: 5, message: "开始探索…" });
        await delay(600);

        send({ status: "generating_content", progress: 25, message: "AI 正在收集资料…" });
        const content = await generateBrandContent(name);
        await delay(900);

        send({ status: "generating_script", progress: 55, message: "写播客脚本…" });
        await delay(1000);

        send({ status: "generating_cards", progress: 80, message: "制作卡片…" });
        await delay(800);

        // persist + search history
        await getStore().saveGenerated(content);
        await getStore().recordSearch({
          id: `${content.brand.slug}-${Date.now()}`,
          query: name,
          ts: Date.now(),
          result: "generated",
          brandSlug: content.brand.slug,
        });
        await delay(500);

        send({ status: "completed", progress: 100, slug: content.brand.slug });
      } catch (err) {
        send({
          status: "error",
          message: err instanceof Error ? err.message : "unknown error",
          progress: 0,
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
