"use client";

import { clsx } from "clsx";
import { useI18n, type Lang } from "@/lib/i18n";

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useI18n();
  const langs: Lang[] = ["zh", "en"];
  return (
    <div
      className={clsx(
        "inline-flex items-center rounded-full border-2 border-bpk-line bg-white p-0.5",
        className,
      )}
    >
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={clsx(
            "rounded-full px-3 py-1 text-sm font-bold transition-colors cursor-pointer",
            lang === l ? "bg-bpk-primary text-white" : "text-bpk-muted hover:text-bpk-ink",
          )}
          aria-pressed={lang === l}
        >
          {l === "zh" ? "中" : "EN"}
        </button>
      ))}
    </div>
  );
}
