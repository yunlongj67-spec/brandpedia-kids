"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

export function LoadingRobot({ progress }: { progress: number }) {
  const { t, lang } = useI18n();

  const steps =
    lang === "zh"
      ? ["📚 正在收集资料…", "✍️ 写播客脚本…", "🎨 制作卡片…", "🏁 马上就好啦！"]
      : ["📚 Gathering info…", "✍️ Writing script…", "🎨 Making cards…", "🏁 Almost there!"];
  const stepIdx = Math.min(steps.length - 1, Math.floor((progress / 100) * steps.length));

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      {/* robot scene */}
      <div className="relative flex h-40 items-end justify-center">
        {/* floating books */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute text-3xl"
            style={{ left: `${28 + i * 18}%`, top: `${10 + (i % 2) * 22}%` }}
            animate={{ y: [0, -10, 0], rotate: [-8, 8, -8] }}
            transition={{ duration: 2 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
          >
            {["📗", "📘", "📙"][i]}
          </motion.div>
        ))}

        {/* robot */}
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          {/* antenna */}
          <div className="mx-auto h-3 w-1 bg-bpk-ink/40" />
          <motion.div
            className="mx-auto -mt-3 h-2 w-2 rounded-full bg-bpk-primary"
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
          {/* head */}
          <div className="mt-1 flex h-16 w-20 flex-col items-center justify-center rounded-2xl border-4 border-bpk-ink bg-bpk-sky shadow-lg">
            <div className="flex gap-2">
              <motion.span
                className="text-lg"
                animate={{ scaleY: [1, 1, 0.1, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, times: [0, 0.9, 0.95, 1] }}
              >
                👀
              </motion.span>
            </div>
            <div className="mt-1 h-1.5 w-8 rounded-full bg-bpk-ink/60" />
          </div>
          {/* body */}
          <div className="mx-auto -mt-1 flex h-12 w-24 items-center justify-center rounded-t-xl rounded-b-2xl border-4 border-bpk-ink bg-white">
            <motion.div
              animate={{ rotate: [0, 25, -25, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              className="text-lg"
            >
              📖
            </motion.div>
          </div>
        </motion.div>
      </div>

      <motion.p
        key={stepIdx}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-lg font-extrabold text-bpk-ink"
      >
        {steps[stepIdx]}
      </motion.p>

      {/* progress bar */}
      <div className="w-full max-w-sm">
        <div className="h-4 w-full overflow-hidden rounded-full border-2 border-white bg-white shadow-inner">
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg,#ffd166,#ff7a59,#6c5ce7)",
            }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-xs font-bold text-bpk-muted">
          <span>{t("yourProgress")}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}
