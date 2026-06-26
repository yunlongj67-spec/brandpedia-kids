import { clsx } from "clsx";
import type { ReactNode } from "react";

export function Badge({
  children,
  className,
  color = "#6c5ce7",
}: {
  children: ReactNode;
  className?: string;
  color?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold text-white",
        className,
      )}
      style={{ backgroundColor: color }}
    >
      {children}
    </span>
  );
}
