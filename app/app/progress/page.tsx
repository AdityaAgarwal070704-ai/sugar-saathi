"use client";

import { useState } from "react";
import InsightsAI from "@/components/InsightsAI";
import ProgressTabs from "@/components/ProgressTabs";
import { ButtonLink } from "@/components/ui/Button";
import { BarChart } from "@/components/ui/BarChart";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pill } from "@/components/ui/Pill";
import { FOODS } from "@/lib/foods-client";
import { weeklyObservations } from "@/lib/insights";
import { weekStats } from "@/lib/stats";
import { dailySeries, gmi, averageGlucose } from "@/lib/trends";
import { MEAL_EMOJI, MEAL_LABEL } from "@/lib/meal";
import { nowMs } from "@/lib/time";
import { useRecent } from "@/lib/useRecent";
import type { MealType } from "@/lib/types";

function Big({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="!p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="tabular mt-1 font-display text-3xl font-semibold">{value}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </Card>
  );
}

export default function Progress() {
  const [days, setDays] = useState<7 | 30>(7);
  const { ready, paired, readings, profile } = useRecent(days);
  if (!ready) return <p className="text-muted">Loading…</p>;

  const stats = weekStats(paired, readings, profile, FOODS);
  const obs = weeklyObservations(stats, profile);
  const series = dailySeries(paired, days, new Date(nowMs()));
  const budget = profile.meal_carb_target * 3;
  const loggedDays = series.filter((d) => d.meals > 0);
  const avg = (k: "protein" | "fibre" | "fat" | "kcal") => (loggedDays.length ? Math.round((loggedDays.reduce((a, d) => a + d[k], 0) / loggedDays.length) * 10) / 10 : 0);
  const g = gmi(readings);
  const avgGlu = averageGlucose(readings);

  const gentle = [...stats.dishRises].sort((a, b) => a.avgRise - b.avgRise).slice(0, 3);
  const spiky = [...stats.dishRises].sort((a, b) => b.avgRise - a.avgRise).slice(0, 3);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">Progress</h1>
        <div className="inline-flex rounded-full border border-line bg-paper p-1" role="group" aria-label="Time range">
          {([7, 30] as const).map((d) => (
            <button key={d} type="button" onClick={() => setDays(d)} aria-pressed={days === d} className={`min-h-9 rounded-full px-4 text-sm font-medium ${days === d ? "bg-moss text-white" : "hover:bg-sand"}`}>{d} days</button>
          ))}
        </div>
      </div>
      <ProgressTabs />

      {stats.meals === 0 ? (
        <EmptyState title="Nothing to chart yet" action={<ButtonLink href="/app/log">Log a meal</ButtonLink>}>
          Log a few meals and your trends appear here: carbs by day, protein and fibre, time in range, and which dishes are gentle or spiky for you.
        </EmptyState>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Big label="Meals logged" value={String(stats.meals)} sub={`${stats.days} of ${days} days`} />
            <Big label="Avg carbs / meal" value={`${stats.avgMealCarbs} g`} sub={`goal ${profile.meal_carb_target} g`} />
            <Big label="Avg rise" value={stats.avgRise !== null ? `${stats.avgRise > 0 ? "+" : ""}${stats.avgRise}` : "–"} sub={stats.avgRise !== null ? `mg/dL, ${stats.pairedMeals} paired meals` : "needs before and 2-hour readings"} />
            <Big label="Time in range" value={stats.inRangePct !== null ? `${stats.inRangePct}%` : "–"} sub={avgGlu !== null ? `average ${avgGlu} mg/dL` : `${profile.glucose_low} to ${profile.glucose_high} mg/dL`} />
          </div>

          <Card>
            <h2 className="font-display text-xl font-semibold">Carbs by day</h2>
            <p className="mb-2 text-sm text-muted">The dashed line is your daily budget of {budget} g.</p>
            <BarChart bars={series.map((d) => ({ label: days === 7 ? d.label : d.date.slice(8), value: d.carbs }))} goal={budget} ariaLabel={`Carbs per day for the last ${days} days`} />
          </Card>

          <Card>
            <h2 className="font-display text-xl font-semibold">A typical day</h2>
            <p className="mb-3 text-sm text-muted">Average over the {loggedDays.length} day{loggedDays.length === 1 ? "" : "s"} you logged.</p>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                ["Carbs", `${loggedDays.length ? Math.round(loggedDays.reduce((a, d) => a + d.carbs, 0) / loggedDays.length) : 0} g`],
                ["Protein", `${avg("protein")} g`],
                ["Fibre", `${avg("fibre")} g`],
                ["Fat", `${avg("fat")} g`],
                ["Calories", `${Math.round(avg("kcal"))}`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl bg-sand px-3 py-2">
                  <dt className="text-xs text-muted">{k}</dt>
                  <dd className="tabular text-xl font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card>
            <h2 className="font-display text-xl font-semibold">Gentle and spiky dishes, for you</h2>
            {stats.dishRises.length < 2 ? (
              <p className="mt-2 text-sm text-muted">Once a dish appears in 2 or more meals that have before and 2-hour readings, it is ranked here using your own data.</p>
            ) : (
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="mb-1.5 text-sm font-semibold text-leaf">Gentlest so far</h3>
                  <ul className="space-y-1.5">{gentle.map((d) => <li key={d.foodId} className="flex justify-between rounded-2xl bg-moss-soft px-3 py-2 text-sm"><span>{d.name}</span><span className="tabular font-semibold">{d.avgRise > 0 ? "+" : ""}{d.avgRise}</span></li>)}</ul>
                </div>
                <div>
                  <h3 className="mb-1.5 text-sm font-semibold text-terracotta">Biggest rises so far</h3>
                  <ul className="space-y-1.5">{spiky.map((d) => <li key={d.foodId} className="flex justify-between rounded-2xl bg-terracotta-soft px-3 py-2 text-sm"><span>{d.name}</span><span className="tabular font-semibold">{d.avgRise > 0 ? "+" : ""}{d.avgRise}</span></li>)}</ul>
                </div>
              </div>
            )}
            <p className="mt-3 text-xs text-muted">Average rise in mg/dL for meals that included the dish. Portions, other dishes, activity and timing all matter, so treat these as possible links to discuss.</p>
          </Card>

          {Object.keys(stats.byMealType).length > 0 && (
            <Card>
              <h2 className="mb-2 font-display text-xl font-semibold">By meal</h2>
              <ul className="divide-y divide-line">
                {(Object.entries(stats.byMealType) as [MealType, NonNullable<(typeof stats.byMealType)[MealType]>][]).map(([k, v]) => (
                  <li key={k} className="flex items-center justify-between py-2.5 text-sm">
                    <span>{MEAL_EMOJI[k]} {MEAL_LABEL[k]} <span className="text-muted">({v.meals})</span></span>
                    <span className="tabular"><strong>{v.avgCarbs} g</strong> carbs{v.avgRise !== null && <> · <Pill tone={v.avgRise > 60 ? "high" : v.avgRise > 30 ? "warn" : "good"}>{v.avgRise > 0 ? "+" : ""}{v.avgRise} mg/dL</Pill></>}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card tone="sand">
            <h2 className="font-display text-xl font-semibold">What stands out</h2>
            <ul className="mt-2 space-y-1.5 text-sm">{obs.map((o) => <li key={o} className="rounded-2xl bg-paper px-3 py-2">{o}</li>)}</ul>
            <p className="mt-2 text-xs text-muted">Possible links to discuss with your educator, not conclusions.</p>
          </Card>

          {g && (
            <Card>
              <h2 className="font-display text-xl font-semibold">Estimated GMI: {g.value}%</h2>
              <p className="mt-1 text-sm text-muted">From {g.readings} imported CGM readings over {g.days} days. GMI is an estimate from average glucose and is not a lab HbA1c. Ask your doctor how to read it.</p>
            </Card>
          )}

          {days === 7 && <InsightsAI stats={stats} goals={profile} />}
        </>
      )}
    </>
  );
}
