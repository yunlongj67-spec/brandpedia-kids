// POST { title, content } → { subject, confidence, method }
//
// Uses the OpenAI-compatible LLM (same env pattern as lib/ai/llm.ts) when
// OPENAI_API_KEY is set. Otherwise — or if the LLM call fails — falls back to
// the local keyword classifier. Always returns 200.

import { classifyLocal } from "@/lib/study/classify";
import { SUBJECT_KEYS, SUBJECTS, type SubjectKey } from "@/lib/study/subjects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You classify a student's study reference into exactly ONE school subject.
Reply with strict JSON only: {"subject": <key>, "confidence": <0..1>}.
Allowed subject keys and what they mean:
- "math": numbers, equations, algebra, geometry, calculus, statistics
- "science": physics, chemistry, biology, experiments, nature, the body
- "language": reading, writing, grammar, vocabulary, essays, foreign languages
- "history": past events, eras, wars, historical figures, civilizations
- "geography": countries, maps, landforms, climate, populations
- "computer-science": programming, code, algorithms, software, the internet
- "art": drawing, painting, design, color, artists
- "music": songs, instruments, rhythm, notes, composers
- "pe": sports, exercise, fitness, games
- "other": none of the above, or unclear
If the text is empty or unclear, use "other". Output JSON only.`;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function isValidKey(key: unknown): key is SubjectKey {
  return typeof key === "string" && (SUBJECT_KEYS as string[]).includes(key);
}

async function classifyWithLLM(
  title: string,
  content: string,
): Promise<{ subject: SubjectKey; confidence: number }> {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = (
    process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1"
  ).replace(/\/$/, "");
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Title: ${title}\n\nContent:\n${content}`.slice(0, 4000),
        },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`LLM ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text: string = data.choices?.[0]?.message?.content ?? "";
  const parsed = JSON.parse(text) as { subject?: unknown; confidence?: unknown };
  return {
    subject: isValidKey(parsed.subject) ? parsed.subject : "other",
    confidence:
      typeof parsed.confidence === "number"
        ? Math.max(0, Math.min(1, parsed.confidence))
        : 0.6,
  };
}

export async function POST(req: Request): Promise<Response> {
  let title = "";
  let content = "";
  try {
    const body = await req.json();
    title = (body?.title ?? "").toString().trim();
    content = (body?.content ?? "").toString().trim();
  } catch {
    /* malformed body → empty strings */
  }

  // Always compute the local result first as a guaranteed fallback.
  const local = classifyLocal(title, content);

  if (!process.env.OPENAI_API_KEY) {
    return json({ ...local, method: "keyword" });
  }

  try {
    const llm = await classifyWithLLM(title, content);
    return json({ ...llm, method: "llm" });
  } catch (err) {
    console.warn("[study/classify] LLM failed, using keyword fallback:", err);
    return json({ ...local, method: "keyword-fallback" });
  }
}

// Surfaced for any future server-side consumers.
export { SUBJECTS };
