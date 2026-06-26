"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Card } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { ImageTextCard } from "./cards/ImageTextCard";
import { ChartCard } from "./cards/ChartCard";
import { QuizCard } from "./cards/QuizCard";
import { TimelineCard } from "./cards/TimelineCard";

function CardBody({ card, color }: { card: Card; color: string }) {
  switch (card.payload.kind) {
    case "image-text":
      return (
        <ImageTextCard payload={card.payload} color={color} title={card.title} titleEn={card.titleEn} />
      );
    case "chart":
      return <ChartCard payload={card.payload} color={color} title={card.title} titleEn={card.titleEn} />;
    case "quiz":
      return <QuizCard payload={card.payload} color={color} title={card.title} titleEn={card.titleEn} />;
    case "timeline":
      return (
        <TimelineCard payload={card.payload} color={color} title={card.title} titleEn={card.titleEn} />
      );
  }
}

export function CardFlow({
  cards,
  color,
  activeCardId,
  onNavigateCard,
}: {
  cards: Card[];
  color: string;
  activeCardId?: string;
  onNavigateCard?: (cardId: string) => void;
}) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(0);

  // follow the podcast's active card
  useEffect(() => {
    if (!activeCardId) return;
    const i = cards.findIndex((c) => c.id === activeCardId);
    if (i >= 0 && i !== index) {
      setDir(i > index ? 1 : -1);
      setIndex(i);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCardId]);

  const goto = (i: number) => {
    const clamped = Math.max(0, Math.min(cards.length - 1, i));
    setDir(clamped > index ? 1 : -1);
    setIndex(clamped);
    onNavigateCard?.(cards[clamped].id);
  };

  const card = cards[index];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-full max-w-md">
        <div className="relative h-80 w-full overflow-hidden rounded-3xl border-2 border-white bg-white/80 shadow-[0_12px_36px_rgba(43,42,76,0.12)] backdrop-blur">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={card.id}
              custom={dir}
              initial={{ opacity: 0, x: dir * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -60 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="h-full w-full overflow-y-auto"
            >
              <CardBody card={card} color={color} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* prev / next (inside the card on mobile, outside on >=sm) */}
        <button
          onClick={() => goto(index - 1)}
          disabled={index === 0}
          className="absolute left-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-white text-xl font-bold text-bpk-ink shadow-md transition-transform hover:scale-110 disabled:opacity-30 cursor-pointer disabled:cursor-default sm:-left-3"
          aria-label="prev"
        >
          ‹
        </button>
        <button
          onClick={() => goto(index + 1)}
          disabled={index === cards.length - 1}
          className="absolute right-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-white text-xl font-bold text-bpk-ink shadow-md transition-transform hover:scale-110 disabled:opacity-30 cursor-pointer disabled:cursor-default sm:-right-3"
          aria-label="next"
        >
          ›
        </button>
      </div>

      {/* dots */}
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {cards.map((c, i) => (
          <button
            key={c.id}
            onClick={() => goto(i)}
            className="h-2 rounded-full transition-all cursor-pointer"
            style={{
              width: i === index ? 22 : 8,
              backgroundColor: i === index ? color : "#e7dcc9",
            }}
            aria-label={`${t("knowledgeTitle")} ${i + 1}`}
          />
        ))}
      </div>
      <p className="text-xs font-semibold text-bpk-muted">
        {index + 1} / {cards.length} · {t("cardFlowTitle")}
      </p>
    </div>
  );
}
