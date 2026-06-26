"use client";

import { motion } from "framer-motion";
import type { ImageTextPayload } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

export function ImageTextCard({
  payload,
  color,
  title,
  titleEn,
}: {
  payload: ImageTextPayload;
  color: string;
  title?: string;
  titleEn?: string;
}) {
  const { pick } = useI18n();
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <motion.div
        initial={{ scale: 0.6, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        className="flex h-28 w-28 items-center justify-center rounded-3xl text-7xl shadow-inner"
        style={{ backgroundColor: `${color}1a` }}
      >
        {payload.emoji}
      </motion.div>
      {title ? (
        <h3 className="text-xl font-extrabold" style={{ color }}>
          {pick(title, titleEn)}
        </h3>
      ) : null}
      <p className="max-w-md text-base font-semibold leading-relaxed text-bpk-ink">
        {pick(payload.text, payload.textEn)}
      </p>
    </div>
  );
}
