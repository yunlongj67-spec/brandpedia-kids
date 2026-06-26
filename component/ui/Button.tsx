"use client";

import { clsx } from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "soft" | "outline";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-bpk-primary text-white shadow-[0_6px_0_#e8623f] hover:translate-y-0.5 hover:shadow-[0_4px_0_#e8623f] active:translate-y-1 active:shadow-none",
  secondary:
    "bg-bpk-secondary text-white shadow-[0_6px_0_#5749c4] hover:translate-y-0.5 hover:shadow-[0_4px_0_#5749c4] active:translate-y-1 active:shadow-none",
  soft: "bg-white text-bpk-ink border-2 border-bpk-line hover:border-bpk-primary",
  outline: "bg-transparent text-bpk-ink border-2 border-bpk-ink/15 hover:border-bpk-primary",
  ghost: "bg-transparent text-bpk-ink hover:bg-black/5",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-xl",
  md: "px-5 py-2.5 text-base rounded-2xl",
  lg: "px-7 py-3.5 text-lg rounded-2xl",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: Props) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-extrabold transition-all duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
