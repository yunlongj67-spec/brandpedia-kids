// BrandPedia Kids — image adapter.
// The app renders kid-friendly emoji + generated SVG illustrations by default
// (no image API needed). When OPENAI_API_KEY is set, DALL·E can generate a real
// illustration for a given prompt.

export interface ImageAdapter {
  available: boolean;
  generate(prompt: string): Promise<string>; // returns a URL or data URL
}

async function generateDallE(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY!;
  const baseUrl = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const res = await fetch(`${baseUrl}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: `cute flat illustration for kids, sticker style, no text: ${prompt}`,
      n: 1,
      size: "1024x1024",
    }),
  });
  if (!res.ok) throw new Error(`DALL·E ${res.status}`);
  const data = await res.json();
  return data.data?.[0]?.url ?? "";
}

/** Inline SVG placeholder (data URL) used when no image API is configured. */
export function placeholderImage(emoji: string, label = ""): string {
  const safe = label.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>
    <rect width='400' height='300' rx='24' fill='#FEF3C7'/>
    <text x='200' y='150' font-size='120' text-anchor='middle' dominant-baseline='central'>${emoji}</text>
    <text x='200' y='250' font-size='22' text-anchor='middle' fill='#92400E' font-family='sans-serif'>${safe}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export class DallEAdapter implements ImageAdapter {
  available = true;
  async generate(prompt: string): Promise<string> {
    try {
      return await generateDallE(prompt);
    } catch (err) {
      console.warn("[image] DALL·E failed, using placeholder:", err);
      return placeholderImage("🎨", prompt);
    }
  }
}

export class PlaceholderAdapter implements ImageAdapter {
  available = false;
  async generate(_prompt: string): Promise<string> {
    return placeholderImage("🎨");
  }
}

let cached: ImageAdapter | null = null;
export function getImageAdapter(): ImageAdapter {
  if (cached) return cached;
  cached = process.env.OPENAI_API_KEY ? new DallEAdapter() : new PlaceholderAdapter();
  return cached;
}
