"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import type { QuizQuestion } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { Button } from "./ui/Button";

export function Quiz({ questions, color }: { questions: QuizQuestion[]; color: string }) {
  const { t, pick } = useI18n();
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (!questions.length) return null;
  const q = questions[idx];
  const answered = picked !== null;

  const choose = (i: number) => {
    if (answered) return;
    setPicked(i);
    if (i === q.correct) setScore((s) => s + 1);
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      setDone(true);
    } else {
      setIdx((i) => i + 1);
      setPicked(null);
    }
  };

  const restart = () => {
    setIdx(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const emoji = pct >= 80 ? "🏆" : pct >= 50 ? "🌟" : "💪";
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border-2 border-white bg-white p-8 text-center shadow-[0_10px_30px_rgba(43,42,76,0.10)]"
      >
        <div className="text-6xl">{emoji}</div>
        <h3 className="mt-3 text-2xl font-extrabold text-bpk-ink">{t("score")}</h3>
        <div className="mt-1 text-4xl font-extrabold" style={{ color }}>
          {score} / {questions.length}
        </div>
        <p className="mt-1 font-semibold text-bpk-muted">({pct}%)</p>
        <Button onClick={restart} variant="soft" className="mt-5">
          🔁 {t("restart")}
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="rounded-3xl border-2 border-white bg-white p-6 shadow-[0_10px_30px_rgba(43,42,76,0.10)]">
      <div className="mb-3 flex items-center justify-between">
        <span
          className="rounded-full px-3 py-1 text-xs font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {idx + 1} / {questions.length}
        </span>
        <span className="text-xs font-bold text-bpk-muted">
          ⭐ {score} {t("correct")}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <h3 className="text-lg font-extrabold text-bpk-ink">
            {pick(q.question, q.questionEn)}
          </h3>
          <div className="mt-3 grid gap-2">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correct;
              const isPicked = i === picked;
              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  disabled={answered}
                  className={clsx(
                    "rounded-2xl border-2 px-4 py-2.5 text-left text-sm font-bold transition-all",
                    !answered && "border-bpk-line hover:border-bpk-primary cursor-pointer",
                    answered && isCorrect && "border-bpk-mint bg-bpk-mint/10",
                    answered && isPicked && !isCorrect && "border-red-400 bg-red-50",
                    answered && !isCorrect && !isPicked && "opacity-50",
                  )}
                >
                  <span className="mr-2 font-extrabold" style={{ color }}>
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {pick(opt, q.optionsEn?.[i] ?? opt)}
                  {answered && isCorrect ? " ✅" : ""}
                  {answered && isPicked && !isCorrect ? " ❌" : ""}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {answered ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 overflow-hidden"
              >
                <div
                  className={clsx(
                    "rounded-2xl p-3 text-sm font-semibold",
                    picked === q.correct ? "bg-bpk-mint/15" : "bg-amber-50",
                  )}
                >
                  <span className="font-extrabold">
                    {picked === q.correct ? `🎉 ${t("correct")} ` : `🤔 ${t("wrong")} `}
                  </span>
                  {pick(q.explanation, q.explanationEn)}
                </div>
                <div className="mt-3 text-right">
                  <Button onClick={next} size="sm">
                    {idx + 1 >= questions.length ? `🏁 ${t("score")}` : `${t("nextQuestion")} →`}
                  </Button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
