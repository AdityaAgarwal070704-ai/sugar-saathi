"use client";

import InsightsAI from "@/components/InsightsAI";
import Stat from "@/components/Stat";
import { FOODS } from "@/lib/foods-client";
import { weeklyObservations } from "@/lib/insights";
import { weekStats } from "@/lib/stats";
import { useRecent } from "@/lib/useRecent";

export default function InsightsPage() {
  const { ready, paired, readings, profile } = useRecent(7);
  if (!ready) return <p className="text-zinc-500">Loading…</p>;
  const stats = weekStats(paired, readings, profile, FOODS);
  const obs = weeklyObservations(stats, profile);

  return (
    <>
      <h1 className="text-2xl font-bold">Weekly insights</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Meals logged" value={String(stats.meals)} sub={`${stats.days} day${stats.days === 1 ? "" : "s"}`} />
        <Stat label="Avg carbs per meal" value={stats.meals ? `${stats.avgMealCarbs} g` : "–"} sub={`goal ${profile.meal_carb_target} g`} />
        <Stat label="Avg fibre / protein" value={stats.meals ? `${stats.avgFibre} / ${stats.avgProtein} g` : "–"} sub="per meal" />
        <Stat label="Avg rise" value={stats.avgRise !== null ? `${stats.avgRise > 0 ? "+" : ""}${stats.avgRise} mg/dL` : "–"} sub={`${stats.pairedMeals} paired meals`} />
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="font-semibold">What stands out this week</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">{obs.map((o) => <li key={o}>{o}</li>)}</ul>
        <p className="mt-2 text-xs text-zinc-500">Patterns are possible links to discuss with your educator, not conclusions.</p>
      </section>

      {Object.keys(stats.byMealType).length > 0 && (
        <section className="rounded-xl border border-zinc-200 bg-white p-4">
          <h2 className="font-semibold">By meal</h2>
          <table className="mt-2 w-full text-sm">
            <thead className="text-left text-zinc-500"><tr><th className="py-1">Meal</th><th>Logged</th><th>Avg carbs</th><th>Avg rise</th></tr></thead>
            <tbody>
              {Object.entries(stats.byMealType).map(([k, v]) => (
                <tr key={k} className="border-t border-zinc-100"><td className="py-1 capitalize">{k}</td><td>{v!.meals}</td><td>{v!.avgCarbs} g</td><td>{v!.avgRise !== null ? `${v!.avgRise > 0 ? "+" : ""}${v!.avgRise} mg/dL` : "–"}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <InsightsAI stats={stats} goals={profile} />
    </>
  );
}
