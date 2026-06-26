"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import type { QuizPayload } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

export function QuizCard({
  payload,
  color,
  title,
  titleEn,
}: {
  payload: QuizPayload;
  color: string;
  title?: string;
  titleEn?: string;
}) {
  const { t, lang, pick } = useI18n();
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;

  return (
    <div className="flex h-full flex-col justify-center gap-3 p-6">
      {title ? (
        <span
          className="mx-auto rounded-full px-3 py-1 text-xs font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {pick(title, titleEn)}
        </span>
      ) : null}
      <h3 className="text-center text-lg font-extrabold text-bpk-ink">
        {pick(payload.question, payload.questionEn)}
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {payload.options.map((opt, i) => {
          const isCorrect = i === payload.correct;
          const isPicked = i === selected;
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.97 }}
              disabled={answered}
              onClick={() => setSelected(i)}
              className={clsx(
                "rounded-2xl border-2 px-4 py-2.5 text-left text-sm font-bold transition-all",
                !answered && "border-bpk-line bg-white hover:border-bpk-primary cursor-pointer",
                answered && isCorrect && "border-bpk-mint bg-bpk-mint/10 text-bpk-ink",
                answered && isPicked && !isCorrect && "border-red-400 bg-red-50 text-bpk-ink",
                answered && !isCorrect && !isPicked && "border-bpk-line bg-white opacity-50",
              )}
            >
              <span className="mr-2">{String.fromCharCode(65 + i)}.</span>
              {pick(opt, payload.optionsEn?.[i] ?? opt)}
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {answered ? (
          <motion.div
            initial={{ y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
              "rounded-2xl p-3 text-sm font-semibold",
              selected === payload.correct ? "bg-bpk-mint/15 text-bpk-ink" : "bg-amber-50 text-bpk-ink",
            )}
          >
            <span className="font-extrabold">
              {selected === payload.correct ? `🎉 ${t("correct")} ` : `🤔 ${t("wrong")} `}
            </span>
            {pick(payload.explanation, payload.explanationEn)}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
