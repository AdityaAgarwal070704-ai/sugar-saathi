import type { MealTips } from "@/lib/insights";

export default function TipsCard({ tips }: { tips: MealTips }) {
  return (
    <div className="space-y-4 text-sm">
      {tips.good.length > 0 && (
        <section>
          <h3 className="mb-1.5 flex items-center gap-2 font-display text-lg font-semibold text-leaf">
            <span aria-hidden="true">✅</span> What&apos;s good
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
            <span aria-hidden="true">💡</span> What could be better
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
            <span aria-hidden="true">🔄</span> Easy swaps
          </h3>
          <ul className="space-y-1.5">
            {tips.swaps.map((s) => (
              <li key={s.from} className="rounded-2xl border border-line bg-paper px-3 py-2">
                <strong>{s.from}</strong> → <strong>{s.to}</strong>: saves about {s.saves} g carbs. <span className="text-muted">{s.note[0].toUpperCase() + s.note.slice(1)}.</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="text-xs text-muted">Suggestions to discuss with your educator or doctor, not medical advice.</p>
    </div>
  );
}
