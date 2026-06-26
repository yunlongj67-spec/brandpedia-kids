"use client";

import { clsx } from "clsx";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

const CAT_ICON: Record<Category | "all", string> = {
  all: "🌈",
  "food-beverage": "🍔",
  entertainment: "🎬",
  technology: "💻",
  sports: "⚽",
  retail: "🛒",
  transport: "🚗",
  other: "🎁",
};

export function CategoryFilter({
  value,
  onChange,
}: {
  value: Category | "all";
  onChange: (c: Category | "all") => void;
}) {
  const { lang, t } = useI18n();
  const items: (Category | "all")[] = ["all", ...CATEGORIES];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((c) => {
        const active = value === c;
        return (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={clsx(
              "inline-flex items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 text-sm font-extrabold transition-all cursor-pointer",
              active
                ? "border-transparent text-white shadow-[0_4px_0_rgba(0,0,0,0.12)]"
                : "border-bpk-line bg-white text-bpk-ink hover:border-bpk-primary",
            )}
            style={active ? { backgroundColor: "#6c5ce7" } : undefined}
          >
            <span>{CAT_ICON[c]}</span>
            <span>{c === "all" ? t("allCategories") : CATEGORY_LABELS[c][lang]}</span>
          </button>
        );
      })}
    </div>
  );
}
