"use client";

import Link from "next/link";
import Stat from "@/components/Stat";
import { FOODS } from "@/lib/foods-client";
import { weeklyObservations } from "@/lib/insights";
import { weekStats } from "@/lib/stats";
import { nowMs } from "@/lib/time";
import { useRecent } from "@/lib/useRecent";

export default function Dashboard() {
  const { ready, meals, readings, paired, profile } = useRecent(7);
  if (!ready) return <p className="text-zinc-500">Loading…</p>;

  const stats = weekStats(paired, readings, profile, FOODS);
  const obs = weeklyObservations(stats, profile);
  const startOfDay = new Date(nowMs());
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
        <h1 className="text-2xl font-bold">Hello{profile.display_name ? `, ${profile.display_name}` : ""}</h1>
        <Link href="/app/log" className="rounded-lg bg-emerald-700 px-4 py-2 text-white">Log a meal</Link>
      </div>

      {meals.length === 0 && readings.length === 0 && (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <h2 className="font-semibold">Welcome to Sugar Saathi</h2>
          <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-zinc-700">
            <li><Link href="/app/log" className="underline">Log a meal</Link> by typing it in everyday words.</li>
            <li>Add your glucose readings on the <Link href="/app/glucose" className="underline">Glucose</Link> page, or import a CSV from your meter or CGM app.</li>
            <li>Come back here to see patterns, and use <Link href="/app/report" className="underline">Report</Link> before your next appointment.</li>
          </ol>
          <p className="mt-2 text-xs text-zinc-600">Everything you enter stays in this browser on this device. Use Settings to back it up.</p>
        </section>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Today's carbs" value={`${todayCarbs} g`} sub={`${today.length} meal${today.length === 1 ? "" : "s"} logged`} />
        <Stat label="Avg daily carbs (7d)" value={stats.days ? `${stats.avgDailyCarbs} g` : "–"} sub={`goal ${profile.meal_carb_target} g per meal`} />
        <Stat label="Avg rise after meals" value={stats.avgRise !== null ? `${stats.avgRise > 0 ? "+" : ""}${stats.avgRise} mg/dL` : "–"} sub={`${stats.pairedMeals} paired meal${stats.pairedMeals === 1 ? "" : "s"}`} />
        <Stat label="Readings in range" value={stats.inRangePct !== null ? `${stats.inRangePct}%` : "–"} sub={`${profile.glucose_low} to ${profile.glucose_high} mg/dL`} />
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
