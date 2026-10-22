import { nowMs } from "@/lib/time";
import Link from "next/link";
import Stat from "@/components/Stat";
import { weeklyObservations } from "@/lib/insights";
import { loadFoods } from "@/lib/foods";
import { loadMeals, loadReadings } from "@/lib/data";
import { pairMeals } from "@/lib/pairing";
import { weekStats } from "@/lib/stats";
import { requireUser } from "@/lib/session";

export default async function Dashboard() {
  const { supabase, profile } = await requireUser();
  const p = profile ?? { plan: "free" as const, display_name: null, meal_carb_target: 60, glucose_low: 70, glucose_high: 180, diet: "veg" as const, id: "" };
  const [foods, meals, readings] = await Promise.all([loadFoods(), loadMeals(supabase, 7), loadReadings(supabase, 7)]);
  const paired = pairMeals(meals, readings);
  const stats = weekStats(paired, readings, p, foods ?? []);
  const obs = weeklyObservations(stats, p);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const today = meals.filter((m) => new Date(m.eaten_at) >= startOfDay);
  const todayCarbs = today.reduce((a, m) => a + m.carbs, 0);

  const waiting = paired.filter((m) => {
    const age = nowMs() - new Date(m.eaten_at).getTime();
    return m.post === null && age >= 90 * 60_000 && age <= 6 * 3600_000;
  });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Hello{p.display_name ? `, ${p.display_name}` : ""}</h1>
        <Link href="/app/log" className="rounded-lg bg-emerald-700 px-4 py-2 text-white">Log a meal</Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Today's carbs" value={`${todayCarbs} g`} sub={`${today.length} meal${today.length === 1 ? "" : "s"} logged`} />
        <Stat label="Avg daily carbs (7d)" value={stats.days ? `${stats.avgDailyCarbs} g` : "–"} sub={`goal ${p.meal_carb_target} g per meal`} />
        <Stat label="Avg rise after meals" value={stats.avgRise !== null ? `${stats.avgRise > 0 ? "+" : ""}${stats.avgRise} mg/dL` : "–"} sub={`${stats.pairedMeals} paired meal${stats.pairedMeals === 1 ? "" : "s"}`} />
        <Stat label="Readings in range" value={stats.inRangePct !== null ? `${stats.inRangePct}%` : "–"} sub={`${p.glucose_low} to ${p.glucose_high} mg/dL`} />
      </div>

      {waiting.length > 0 && (
        <section className="rounded-xl border border-amber-300 bg-amber-50 p-4">
          <h2 className="font-semibold">2-hour readings to add</h2>
          <p className="text-sm text-zinc-700">
            {waiting.length} recent meal{waiting.length === 1 ? " is" : "s are"} missing a 2-hour reading: {waiting.slice(0, 3).map((m) => `"${m.text}"`).join(", ")}. Add it from <Link className="underline" href="/app/history">History</Link> or <Link className="underline" href="/app/glucose">Glucose</Link>.
          </p>
        </section>
      )}

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">This week at a glance</h2>
          <Link href="/app/insights" className="text-sm text-emerald-800 underline">All insights</Link>
        </div>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">
          {obs.slice(0, 4).map((o) => <li key={o}>{o}</li>)}
        </ul>
      </section>

    </>
  );
}
