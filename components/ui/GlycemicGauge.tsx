import { glycemicImpact, IMPACT_TEXT, IMPACT_LOW_MAX, IMPACT_MEDIUM_MAX } from "@/lib/impact";

const MAX = 45; // gauge scale; anything above is pinned to the end

export function GlycemicGauge({ gl }: { gl: number }) {
  const level = glycemicImpact(gl);
  const pos = Math.min(100, (gl / MAX) * 100);
  const label = { low: "Low", medium: "Medium", high: "High" }[level];
  const color = { low: "text-leaf", medium: "text-saffron-ink", high: "text-terracotta" }[level];
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <p className={`font-display text-xl font-semibold sm:text-2xl ${color}`}>{label} glycemic impact</p>
        <p className="tabular text-sm text-muted">load {gl}</p>
      </div>
      <div className="relative mt-3 h-3 rounded-full" role="img" aria-label={`Glycemic load ${gl}, ${label}`} style={{ background: `linear-gradient(90deg, #2f7d4f 0 ${(IMPACT_LOW_MAX / MAX) * 100}%, #e9a23b ${(IMPACT_LOW_MAX / MAX) * 100}% ${(IMPACT_MEDIUM_MAX / MAX) * 100}%, #b84a32 ${(IMPACT_MEDIUM_MAX / MAX) * 100}% 100%)` }}>
        <span className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-paper bg-ink shadow-soft transition-all duration-700" style={{ left: `${pos}%` }} />
      </div>
      <p className="mt-2 text-sm text-muted">{IMPACT_TEXT[level]}. A general guide from the food table, not a prediction for you.</p>
    </div>
  );
}
