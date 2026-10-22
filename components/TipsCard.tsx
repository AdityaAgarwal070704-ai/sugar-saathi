"use client";

import type { MealTips } from "@/lib/insights";
import { useT } from "@/lib/useT";

export default function TipsCard({ tips }: { tips: MealTips }) {
  const { t } = useT();
  return (
    <div className="space-y-4 text-sm">
      {tips.good.length > 0 && (
        <section>
          <h3 className="mb-1.5 flex items-center gap-2 font-display text-lg font-semibold text-leaf">
            <span aria-hidden="true">✅</span> {t("tips.goodTitle")}
          </h3>
          <ul className="space-y-1.5">
            {tips.good.map((g) => (
              <li key={g} className="rounded-2xl bg-moss-soft px-3 py-2">{g}</li>
            ))}
          </ul>
        </section>
      )}
      {tips.improve.length > 0 && (
        <section>
          <h3 className="mb-1.5 flex items-center gap-2 font-display text-lg font-semibold text-saffron-ink">
            <span aria-hidden="true">💡</span> {t("tips.improveTitle")}
          </h3>
          <ul className="space-y-1.5">
            {tips.improve.map((g) => (
              <li key={g} className="rounded-2xl bg-saffron-soft px-3 py-2">{g}</li>
            ))}
          </ul>
        </section>
      )}
      {tips.swaps.length > 0 && (
        <section>
          <h3 className="mb-1.5 flex items-center gap-2 font-display text-lg font-semibold">
            <span aria-hidden="true">🔄</span> {t("tips.swapsTitle")}
          </h3>
          <ul className="space-y-1.5">
            {tips.swaps.map((s) => (
              <li key={s.from} className="rounded-2xl border border-line bg-paper px-3 py-2">
                <strong>{s.from}</strong> → <strong>{s.to}</strong>: {t("tips.saves", { n: s.saves })} <span className="text-muted">{s.note[0].toUpperCase() + s.note.slice(1)}{s.note.endsWith("।") ? "" : "."}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="text-xs text-muted">{t("tips.disclaimer")}</p>
    </div>
  );
}
