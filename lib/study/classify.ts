// Keyword-based subject classifier — the always-on fallback used when no LLM
// API key is configured (and as a safety net if the LLM call fails).
// Isomorphic: safe to import from both client and server code.

import { SUBJECTS, type SubjectKey } from "./subjects";

export interface ClassifyResult {
  subject: SubjectKey;
  /** 0–1; how confident the classifier is */
  confidence: number;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Count whole-word matches of `keyword` in `haystack`.
 *  ASCII keywords use word boundaries; non-ASCII (e.g. Chinese) use substring. */
function countMatches(haystack: string, keyword: string): number {
  if (!keyword) return 0;
  if (/[^\x00-\x7f]/.test(keyword)) {
    let n = 0;
    let i = 0;
    while ((i = haystack.indexOf(keyword, i)) !== -1) {
      n += 1;
      i += keyword.length;
    }
    return n;
  }
  const re = new RegExp(`\\b${escapeRe(keyword)}\\b`, "gi");
  return (haystack.match(re) || []).length;
}

/**
 * Score each subject by keyword frequency. Title hits count double (titles are
 * strong signals). Highest score wins; ties resolve to the earlier-listed
 * subject. Zero signal → "other".
 */
export function classifyLocal(title: string, content: string): ClassifyResult {
  const t = (title || "").toLowerCase();
  const c = (content || "").toLowerCase();

  const scored = SUBJECTS.filter((s) => s.key !== "other")
    .map((s) => {
      let score = 0;
      for (const kw of s.keywords) {
        score += countMatches(t, kw) * 2;
        score += countMatches(c, kw);
      }
      return { key: s.key, score };
    })
    .sort((a, b) => b.score - a.score);

  const top = scored[0];
  const runner = scored[1]?.score ?? 0;
  if (!top || top.score === 0) {
    return { subject: "other", confidence: 0 };
  }

  // Margin between top and runner-up, damped slightly when signal is thin.
  const base = runner > 0 ? top.score / (top.score + runner) : 1;
  const conf = base * (0.7 + 0.3 * Math.min(1, top.score / 3));
  return {
    subject: top.key,
    confidence: Math.max(0.4, Math.min(0.99, Math.round(conf * 100) / 100)),
  };
}
