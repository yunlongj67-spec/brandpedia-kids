"use client";

import { clsx } from "clsx";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

const CAT_ICON: Record<Category | "all", string> = {
  all: "✦",
  "food-beverage": "🍔",
  entertainment: "🎬",
  technology: "💻",
  sports: "⚽",
  retail: "🛍️",
  transport: "🚗",
  other: "🎁",
};

export function CategoryFilter({
  value,
  onChange,
}: {
  value: Category | "all";
  onChange: (category: Category | "all") => void;
}) {
  const { lang, t } = useI18n();
  const items: (Category | "all")[] = ["all", ...CATEGORIES];

  return (
    <div
      className="flex snap-x gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label={lang === "zh" ? "品牌分类" : "Brand categories"}
    >
      {items.map((category) => {
        const active = value === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            aria-pressed={active}
            className={clsx(
              "inline-flex shrink-0 snap-start items-center gap-1.5 rounded-xl border-2 border-bpk-ink px-3.5 py-2 text-sm font-black transition-all",
              active
                ? "translate-y-[-2px] bg-bpk-secondary text-white shadow-[3px_3px_0_#2b2a4c]"
                : "bg-white text-bpk-ink hover:bg-bpk-sun",
            )}
          >
            <span>{CAT_ICON[category]}</span>
            <span>
              {category === "all" ? t("allCategories") : CATEGORY_LABELS[category][lang]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
