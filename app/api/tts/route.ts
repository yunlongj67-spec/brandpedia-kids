import { getStore } from "@/lib/storage";
import { ttsAvailable, synthesizeSegment } from "@/lib/ai/tts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// When a real TTS provider (ElevenLabs/Azure) is configured, this pre-synthesizes
// every podcast segment so the player can play real audio with true seek.
// Otherwise it reports mode "web" and the player uses the browser Web Speech API.
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return Response.json({ mode: "web" });
  if (!ttsAvailable()) return Response.json({ mode: "web" });

  const content = await getStore().getBrandContent(slug);
  if (!content) return Response.json({ mode: "web" });

  try {
    const segments: Record<string, string> = {};
    for (const seg of content.script.segments) {
      segments[seg.id] = await synthesizeSegment(seg.text, seg.speaker);
    }
    return Response.json({ mode: "audio", segments });
  } catch (err) {
    console.warn("[tts] synthesis failed, falling back to web speech:", err);
    return Response.json({ mode: "web" });
  }
}
