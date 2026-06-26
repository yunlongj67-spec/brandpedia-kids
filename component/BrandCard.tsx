"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Brand } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

export function BrandCard({ brand, index = 0 }: { brand: Brand; index?: number }) {
  const router = useRouter();
  const { lang, pick } = useI18n();
  const [flipped, setFlipped] = useState(false);
  const [hovered, setHovered] = useState(false);

  const go = () => {
    setFlipped(true);
    setTimeout(() => router.push(`/brand/${brand.slug}`), 1300);
  };

  const cat = CATEGORY_LABELS[brand.category][lang];

  return (
    <motion.button
      type="button"
      onClick={go}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ y: 24, scale: 0.9 }}
      animate={{ y: 0, scale: 1 }}
      transition={{ delay: Math.min(index * 0.03, 0.6), type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.97 }}
      className="relative h-44 w-full cursor-pointer text-left [perspective:1200px]"
      aria-label={`${pick(brand.name, brand.nameEn)} — ${pick(brand.slogan, brand.sloganEn)}`}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="preserve-3d relative h-full w-full"
      >
        {/* FRONT */}
        <div
          className="backface-hidden absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-2 border-white bg-white shadow-[0_10px_30px_rgba(43,42,76,0.10)]"
          style={{ borderTopColor: brand.color, borderTopWidth: 6 }}
        >
          <div
            className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: brand.color }}
          />
          <motion.div
            animate={hovered ? { rotate: [0, -8, 8, 0], scale: 1.1 } : { rotate: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-6xl drop-shadow-sm"
          >
            {brand.logo}
          </motion.div>
          <div className="mt-2 text-lg font-extrabold text-bpk-ink">
            {pick(brand.name, brand.nameEn)}
          </div>
          <motion.div
            initial={false}
            animate={{
              opacity: hovered ? 1 : 0,
              y: hovered ? 0 : 6,
              height: hovered ? "auto" : 0,
            }}
            className="overflow-hidden px-3 text-center text-xs font-semibold text-bpk-muted"
          >
            {pick(brand.slogan, brand.sloganEn)}
          </motion.div>
          <span
            className="absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
            style={{ backgroundColor: brand.color }}
          >
            {cat}
          </span>
        </div>

        {/* BACK */}
        <div
          className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-3xl p-4 text-center shadow-[0_10px_30px_rgba(43,42,76,0.10)]"
          style={{ backgroundColor: brand.color }}
        >
          <div className="text-3xl">💡</div>
          <p className="text-sm font-bold leading-snug text-white">
            {pick(brand.funFact, brand.funFactEn ?? brand.description)}
          </p>
          <span className="mt-1 rounded-full bg-white/25 px-3 py-1 text-xs font-bold text-white">
            {lang === "zh" ? "点我进去看故事 →" : "Tap to read →"}
          </span>
        </div>
      </motion.div>
    </motion.button>
  );
}
