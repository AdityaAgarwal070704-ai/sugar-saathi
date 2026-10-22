"use client";

import { glycemicImpact, IMPACT_LOW_MAX, IMPACT_MEDIUM_MAX } from "@/lib/impact";
import { useT } from "@/lib/useT";

const MAX = 45; // gauge scale; anything above is pinned to the end

export function GlycemicGauge({ gl }: { gl: number }) {
  const { t } = useT();
  const level = glycemicImpact(gl);
  const pos = Math.min(100, (gl / MAX) * 100);
  const label = t(`gauge.${level}` as const);
  const color = { low: "text-leaf", medium: "text-saffron-ink", high: "text-terracotta" }[level];
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <p className={`font-display text-xl font-semibold sm:text-2xl ${color}`}>{label}</p>
        <p className="tabular text-sm text-muted">{t("gauge.load", { n: gl })}</p>
      </div>
      <div className="relative mt-3 h-3 rounded-full" role="img" aria-label={`${label}, ${gl}`} style={{ background: `linear-gradient(90deg, #2f7d4f 0 ${(IMPACT_LOW_MAX / MAX) * 100}%, #e9a23b ${(IMPACT_LOW_MAX / MAX) * 100}% ${(IMPACT_MEDIUM_MAX / MAX) * 100}%, #b84a32 ${(IMPACT_MEDIUM_MAX / MAX) * 100}% 100%)` }}>
        <span className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-paper bg-ink shadow-soft transition-all duration-700" style={{ left: `${pos}%` }} />
      </div>
      <p className="mt-2 text-sm text-muted">{t(`gauge.${level}.text` as const)}. {t("gauge.note")}</p>
    </div>
  );
}
