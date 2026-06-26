"use client";

import { clsx } from "clsx";
import type { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...rest }: Props) {
  return (
    <input
      className={clsx(
        "w-full rounded-2xl border-2 border-bpk-line bg-white px-4 py-3 text-base text-bpk-ink placeholder:text-bpk-muted/60 outline-none transition-colors focus:border-bpk-primary",
        className,
      )}
      {...rest}
    />
  );
}
