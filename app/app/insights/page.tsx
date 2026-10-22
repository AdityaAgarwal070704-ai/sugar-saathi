import InsightsAI from "@/components/InsightsAI";
import Stat from "@/components/Stat";
import { LockedCard } from "@/components/Upgrade";
import { loadMeals, loadReadings } from "@/lib/data";
import { loadFoods } from "@/lib/foods";
import { weeklyObservations } from "@/lib/insights";
import { pairMeals } from "@/lib/pairing";
import { weekStats } from "@/lib/stats";
import { requireUser } from "@/lib/session";

export default async function InsightsPage() {
  const { supabase, profile } = await requireUser();
  const p = profile ?? { plan: "free" as const, display_name: null, meal_carb_target: 60, glucose_low: 70, glucose_high: 180, diet: "veg" as const, id: "" };
  const [foods, meals, readings] = await Promise.all([loadFoods(), loadMeals(supabase, 7), loadReadings(supabase, 7)]);
  const stats = weekStats(pairMeals(meals, readings), readings, p, foods ?? []);
  const obs = weeklyObservations(stats, p);

  return (
    <>
      <h1 className="text-2xl font-bold">Weekly insights</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Meals logged" value={String(stats.meals)} sub={`${stats.days} day${stats.days === 1 ? "" : "s"}`} />
        <Stat label="Avg carbs per meal" value={stats.meals ? `${stats.avgMealCarbs} g` : "–"} sub={`goal ${p.meal_carb_target} g`} />
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

      {p.plan === "pro" ? (
        <InsightsAI />
      ) : (
        <LockedCard title="AI weekly summary">A plain-language write-up of your week: possible links between meals and glucose, confounders to note, and food ideas for next week.</LockedCard>
      )}
    </>
  );
}
