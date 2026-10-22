import type { HTMLAttributes } from "react";

const TONES = {
  paper: "bg-paper border border-line text-ink",
  sand: "bg-sand border border-line text-ink",
  moss: "bg-moss text-white border border-moss-deep",
  saffron: "bg-saffron-soft border border-saffron/40 text-ink",
  alert: "bg-terracotta-soft border border-terracotta/40 text-ink",
} as const;

export function Card({ tone = "paper", className = "", ...rest }: HTMLAttributes<HTMLDivElement> & { tone?: keyof typeof TONES }) {
  return <div className={`rounded-3xl p-5 shadow-soft ${TONES[tone]} ${className}`} {...rest} />;
}
