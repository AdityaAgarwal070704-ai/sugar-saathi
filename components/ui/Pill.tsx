import type { ReactNode } from "react";

const TONES = {
  neutral: "bg-sand text-ink",
  good: "bg-moss-soft text-moss",
  warn: "bg-saffron-soft text-saffron-ink",
  high: "bg-terracotta-soft text-terracotta",
  dark: "bg-moss text-white",
} as const;

export function Pill({ tone = "neutral", children, className = "" }: { tone?: keyof typeof TONES; children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${TONES[tone]} ${className}`}>{children}</span>;
}
