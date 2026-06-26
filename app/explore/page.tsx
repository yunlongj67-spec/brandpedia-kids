"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { SiteHeader } from "@/component/SiteHeader";
import { LoadingRobot } from "@/component/LoadingRobot";
import { Input } from "@/component/ui/Input";
import { Button } from "@/component/ui/Button";

type Status = "idle" | "loading" | "done" | "error";

function ExploreInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { t, lang } = useI18n();
  const initial = params.get("q") ?? "";
  const [name, setName] = useState(initial);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [resultSlug, setResultSlug] = useState<string | null>(null);
  const startedRef = useRef(false);

  const start = async (brandName: string) => {
    const clean = brandName.trim();
    if (!clean) return;
    setStatus("loading");
    setProgress(0);
    setResultSlug(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: clean }),
      });
      if (!res.ok || !res.body) throw new Error("generate failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // safety timeout: if the stream stalls, still complete via direct fetch
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          try {
            const evt = JSON.parse(trimmed.slice(5).trim());
            if (typeof evt.progress === "number") setProgress(evt.progress);
            if (evt.status === "completed" && evt.slug) {
              setProgress(100);
              setResultSlug(evt.slug);
              setStatus("done");
              setTimeout(() => router.push(`/generated/${evt.slug}`), 900);
              return;
            }
            if (evt.status === "error") throw new Error(evt.message || "error");
          } catch {
            /* ignore non-JSON keepalive lines */
          }
        }
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  // auto-start when navigated with ?q=
  useEffect(() => {
    if (initial && !startedRef.current) {
      startedRef.current = true;
      start(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 pt-4">
        {status === "idle" ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border-2 border-white bg-white p-6 shadow-[0_12px_36px_rgba(43,42,76,0.12)] sm:p-8"
          >
            <div className="text-center">
              <div className="text-6xl">🤖</div>
              <h1 className="mt-3 text-2xl font-extrabold text-bpk-ink sm:text-3xl">
                {t("exploreTitle")}
              </h1>
              <p className="mx-auto mt-2 max-w-md font-semibold text-bpk-muted">
                {t("exploreDesc")}
              </p>
            </div>
            <form
              className="mt-6 flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                start(name);
              }}
            >
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("explorePlaceholder")}
                autoFocus
              />
              <Button type="submit" size="lg" disabled={!name.trim()}>
                ✨ {t("exploreBtn")}
              </Button>
            </form>
            <p className="mt-3 text-center text-xs font-semibold text-bpk-muted">
              {lang === "zh"
                ? "预计等待 10–20 秒（演示模式）· 配置 LLM key 后可生成更丰富内容"
                : "Takes ~10–20s in demo mode · add an LLM key for richer content"}
            </p>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm font-bold text-bpk-primary hover:underline"
              >
                ← {t("backHome")}
              </Link>
            </div>
          </motion.div>
        ) : null}

        {status === "loading" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl border-2 border-white bg-white p-6 shadow-[0_12px_36px_rgba(43,42,76,0.12)]"
          >
            <h2 className="mb-2 text-center text-xl font-extrabold text-bpk-ink">
              {t("generating")}
            </h2>
            <p className="mb-2 text-center text-sm font-semibold text-bpk-muted">
              {name} · {t("generatingSteps")}
            </p>
            <LoadingRobot progress={progress} />
          </motion.div>
        ) : null}

        {status === "done" && resultSlug ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border-2 border-white bg-white p-8 text-center shadow-[0_12px_36px_rgba(43,42,76,0.12)]"
          >
            <div className="text-6xl">🎉</div>
            <h2 className="mt-3 text-2xl font-extrabold text-bpk-ink">{t("completed")}</h2>
            <p className="mt-1 font-semibold text-bpk-muted">{name}</p>
            <Button
              onClick={() => router.push(`/generated/${resultSlug}`)}
              className="mt-5"
              size="lg"
            >
              {t("viewBrand")} →
            </Button>
          </motion.div>
        ) : null}

        {status === "error" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl border-2 border-white bg-white p-8 text-center shadow-[0_12px_36px_rgba(43,42,76,0.12)]"
          >
            <div className="text-5xl">😵</div>
            <h2 className="mt-3 text-xl font-extrabold text-bpk-ink">
              {lang === "zh" ? "生成出错了，再试一次？" : "Something went wrong, try again?"}
            </h2>
            <Button onClick={() => setStatus("idle")} variant="soft" className="mt-4">
              ↩ {lang === "zh" ? "返回" : "Back"}
            </Button>
          </motion.div>
        ) : null}
      </main>
    </>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold text-bpk-muted">…</div>}>
      <ExploreInner />
    </Suspense>
  );
}
