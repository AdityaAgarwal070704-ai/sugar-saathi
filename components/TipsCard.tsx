import type { MealTips } from "@/lib/insights";

const RATING_STYLE = {
  lower: "bg-emerald-100 text-emerald-900",
  moderate: "bg-amber-100 text-amber-900",
  higher: "bg-red-100 text-red-900",
} as const;

export default function TipsCard({ tips }: { tips: MealTips }) {
  return (
    <div className="space-y-3 text-sm">
      <p className={`rounded px-3 py-2 font-medium ${RATING_STYLE[tips.rating]}`}>{tips.headline}</p>
      {tips.good.length > 0 && (
        <div>
          <h3 className="font-semibold text-emerald-800">What&apos;s good</h3>
          <ul className="list-disc pl-5 text-zinc-700">{tips.good.map((g) => <li key={g}>{g}</li>)}</ul>
        </div>
      )}
      {tips.improve.length > 0 && (
        <div>
          <h3 className="font-semibold text-amber-800">What could be better</h3>
          <ul className="list-disc pl-5 text-zinc-700">{tips.improve.map((g) => <li key={g}>{g}</li>)}</ul>
        </div>
      )}
      {tips.swaps.length > 0 && (
        <div>
          <h3 className="font-semibold">Swaps to consider</h3>
          <ul className="list-disc pl-5 text-zinc-700">
            {tips.swaps.map((s) => (
              <li key={s.from}>
                {s.from} → {s.to}: saves about {s.saves} g carbs ({s.note}).
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-xs text-zinc-500">Suggestions to discuss with your educator or doctor, not medical advice.</p>
    </div>
  );
}
