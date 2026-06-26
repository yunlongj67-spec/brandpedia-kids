// BrandPedia Kids — TTS adapter (server side).
// The player uses the browser Web Speech API by default (zero setup).
// When ELEVENLABS_API_KEY or AZURE_SPEECH_KEY is set, this module can
// pre-synthesize per-segment audio (mp3) so the player can play real audio with
// true seek via the /api/tts route.

export type TTSProvider = "web" | "elevenlabs" | "azure";

export interface SynthesizedSegment {
  id: string;
  url: string; // data: URL (audio/mpeg) or remote URL
  voiceName: string;
}

export interface VoicePair {
  host1: { id: string; name: string };
  host2: { id: string; name: string };
}

export function getTTSProvider(): TTSProvider {
  if (process.env.ELEVENLABS_API_KEY) return "elevenlabs";
  if (process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION) return "azure";
  return "web";
}

export function ttsAvailable(): boolean {
  return getTTSProvider() !== "web";
}

export function getVoicePair(): VoicePair {
  const p = getTTSProvider();
  if (p === "elevenlabs") {
    return {
      host1: { id: process.env.ELEVENLABS_VOICE_1 ?? "21m00Tcm4TlvDq8ikWAM", name: "乐乐" },
      host2: { id: process.env.ELEVENLABS_VOICE_2 ?? "AZnzlk1XvdvUeBnXmlld", name: "问问" },
    };
  }
  if (p === "azure") {
    return {
      host1: { id: "zh-CN-XiaoxiaoNeural", name: "乐乐" },
      host2: { id: "zh-CN-YunyangNeural", name: "问问" },
    };
  }
  return {
    host1: { id: "host1", name: "乐乐" },
    host2: { id: "host2", name: "问问" },
  };
}

async function synthElevenLabs(text: string, voiceId: string): Promise<string> {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.7 },
    }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return `data:audio/mpeg;base64,${buf.toString("base64")}`;
}

async function synthAzure(text: string, voiceName: string): Promise<string> {
  const region = process.env.AZURE_SPEECH_REGION!;
  const tokenRes = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
    method: "POST",
    headers: { "Ocp-Apim-Subscription-Key": process.env.AZURE_SPEECH_KEY! },
  });
  if (!tokenRes.ok) throw new Error(`Azure token ${tokenRes.status}`);
  const token = await tokenRes.text();
  const ssrf = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const ssml = `<speak version='1.0' xml:lang='zh-CN'><voice name='${voiceName}'>${text.replace(
    /[<>&]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!),
  )}</voice></speak>`;
  const res = await fetch(ssrf, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Microsoft-OutputFormat": "audio-mpeg-128-kbits-44100hz",
      "Content-Type": "application/ssml+xml",
    },
    body: ssml,
  });
  if (!res.ok) throw new Error(`Azure synth ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return `data:audio/mpeg;base64,${buf.toString("base64")}`;
}

/** Synthesize a single segment to a data URL using the configured provider. */
export async function synthesizeSegment(
  text: string,
  speaker: "host1" | "host2",
): Promise<string> {
  const pair = getVoicePair();
  const voice = speaker === "host1" ? pair.host1 : pair.host2;
  const provider = getTTSProvider();
  if (provider === "elevenlabs") return synthElevenLabs(text, voice.id);
  if (provider === "azure") return synthAzure(text, voice.id);
  throw new Error("TTS provider is 'web' (browser); nothing to synthesize server-side");
}
