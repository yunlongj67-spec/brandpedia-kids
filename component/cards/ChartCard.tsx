"use client";

import { motion } from "framer-motion";
import type { ChartPayload } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

export function ChartCard({
  payload,
  color,
  title,
  titleEn,
}: {
  payload: ChartPayload;
  color: string;
  title?: string;
  titleEn?: string;
}) {
  const { pick } = useI18n();
  const max = Math.max(...payload.values, 1);

  return (
    <div className="flex h-full flex-col justify-center gap-4 p-6">
      {title ? (
        <h3 className="text-center text-xl font-extrabold" style={{ color }}>
          {pick(title, titleEn)}
        </h3>
      ) : null}
      <div className="flex flex-1 items-end justify-center gap-4">
        {payload.labels.map((label, i) => {
          const h = Math.max(8, (payload.values[i] / max) * 100);
          return (
            <div key={i} className="flex w-1/4 max-w-[90px] flex-col items-center gap-2">
              <div className="text-lg font-extrabold" style={{ color }}>
                {payload.values[i]}
                <span className="ml-0.5 text-xs font-bold text-bpk-muted">
                  {payload.values[i] >= 10 ? "" : ""}
                </span>
              </div>
              <div className="flex h-40 w-full items-end justify-center">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.12, type: "spring", stiffness: 120, damping: 16 }}
                  className="w-full max-w-[64px] rounded-t-2xl"
                  style={{
                    backgroundColor: color,
                    backgroundImage: `linear-gradient(180deg, ${color}, ${color}cc)`,
                  }}
                />
              </div>
              <div className="text-center text-xs font-bold leading-tight text-bpk-muted">
                {pick(label, payload.labelsEn?.[i] ?? label)}
                {payload.unit ? (
                  <span className="block text-[10px] text-bpk-muted/70">
                    {pick(payload.unit, payload.unitEn)}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-center text-sm font-semibold text-bpk-muted">
        {pick(payload.caption, payload.captionEn)}
      </p>
    </div>
  );
}
