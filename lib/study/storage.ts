// Client-side persistence for study references via localStorage.
// Browser-only: every helper no-ops (returning empty/stale) when `window` is
// undefined, so these are safe to call during SSR render.

import type { SubjectKey } from "./subjects";

export interface StudyReference {
  id: string;
  title: string;
  content: string;
  link?: string;
  subject: SubjectKey;
  createdAt: number;
  updatedAt: number;
}

export type StudyReferenceInput = Omit<
  StudyReference,
  "id" | "createdAt" | "updatedAt"
>;

const KEY = "bpk.study.references.v1";

function isBrowser(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function read(): StudyReference[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as StudyReference[];
  } catch {
    return [];
  }
}

function write(refs: StudyReference[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(refs));
  } catch {
    /* quota / private mode — silently ignore */
  }
}

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const byRecent = (a: StudyReference, b: StudyReference) =>
  b.updatedAt - a.updatedAt;

/** All references, newest first. */
export function listReferences(): StudyReference[] {
  return read().sort(byRecent);
}

/** Create a new reference; returns the updated list. */
export function saveReference(input: StudyReferenceInput): StudyReference[] {
  const now = Date.now();
  const ref: StudyReference = {
    ...input,
    id: genId(),
    createdAt: now,
    updatedAt: now,
  };
  const refs = [ref, ...read()];
  write(refs);
  return refs.sort(byRecent);
}

/** Patch an existing reference by id; returns the updated list. */
export function updateReference(
  id: string,
  patch: Partial<StudyReferenceInput>,
): StudyReference[] {
  const refs = read().map((r) =>
    r.id === id ? { ...r, ...patch, updatedAt: Date.now() } : r,
  );
  write(refs);
  return refs.sort(byRecent);
}

/** Delete a reference by id; returns the updated list. */
export function removeReference(id: string): StudyReference[] {
  const refs = read().filter((r) => r.id !== id);
  write(refs);
  return refs.sort(byRecent);
}
