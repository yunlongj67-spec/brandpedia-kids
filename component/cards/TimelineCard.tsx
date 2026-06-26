"use client";

import { motion } from "framer-motion";
import type { TimelinePayload } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

export function TimelineCard({
  payload,
  color,
  title,
  titleEn,
}: {
  payload: TimelinePayload;
  color: string;
  title?: string;
  titleEn?: string;
}) {
  const { pick } = useI18n();
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-6">
      {title ? (
        <h3 className="text-center text-xl font-extrabold" style={{ color }}>
          {pick(title, titleEn)}
        </h3>
      ) : null}
      <div className="relative mx-auto max-w-md pl-6">
        <div
          className="absolute left-[7px] top-1 bottom-1 w-0.5 rounded"
          style={{ backgroundColor: `${color}55` }}
        />
        <div className="flex flex-col gap-4">
          {payload.events.map((e, i) => (
            <motion.div
              key={i}
              initial={{ x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="relative"
            >
              <span
                className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white"
                style={{ backgroundColor: color }}
              />
              <div className="flex items-baseline gap-2">
                <span className="rounded-lg px-2 py-0.5 text-sm font-extrabold text-white" style={{ backgroundColor: color }}>
                  {e.year}
                </span>
                <span className="font-extrabold text-bpk-ink">{pick(e.title, e.titleEn)}</span>
              </div>
              <p className="mt-1 text-sm font-medium text-bpk-muted">{pick(e.desc, e.descEn)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
