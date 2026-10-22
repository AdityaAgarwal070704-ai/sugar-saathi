"use client";

import CsvImport from "@/components/CsvImport";
import GlucoseQuickAdd from "@/components/GlucoseQuickAdd";
import ProgressTabs from "@/components/ProgressTabs";
import { Card } from "@/components/ui/Card";
import { GlucoseChart } from "@/components/ui/GlucoseChart";
import { MEAL_LABEL } from "@/lib/meal";
import { nowMs } from "@/lib/time";
import { averageGlucose, timeInRange } from "@/lib/trends";
import { useRecent } from "@/lib/useRecent";

export default function GlucosePage() {
  const { ready, readings, meals, profile } = useRecent(365);
  if (!ready) return <p className="text-muted">Loading…</p>;
  const { glucose_low: low, glucose_high: high } = profile;

  const cut = nowMs() - 3 * 86400_000;
  const recent = readings.filter((r) => new Date(r.measured_at).getTime() >= cut).sort((a, b) => a.measured_at.localeCompare(b.measured_at));
  const recentMeals = meals.filter((m) => new Date(m.eaten_at).getTime() >= cut);
  const avg = averageGlucose(readings);
  const tir = timeInRange(readings, low, high);

  return (
    <>
      <h1 className="font-display text-3xl font-semibold">Progress</h1>
      <ProgressTabs />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-display text-xl font-semibold">Add a reading</h2>
          <p className="mb-3 text-sm text-muted">Sugar Saathi never makes up readings. It only uses values you enter or import.</p>
          <GlucoseQuickAdd />
        </Card>
        <Card>
          <h2 className="font-display text-xl font-semibold">Import from your meter or CGM</h2>
          <div className="mt-3"><CsvImport /></div>
        </Card>
      </div>

      {readings.length > 0 && (
        <Card>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-xl font-semibold">Last 3 days</h2>
            <p className="tabular text-sm text-muted">{readings.length} readings · average {avg} mg/dL · {tir}% in range</p>
          </div>
          {recent.length > 0 ? (
            <div className="mt-2">
              <GlucoseChart points={recent.slice(-120).map((r) => ({ t: new Date(r.measured_at).getTime(), v: r.value }))} markers={recentMeals.map((m) => ({ t: new Date(m.eaten_at).getTime(), label: MEAL_LABEL[m.meal_type] }))} low={low} high={high} ariaLabel="Glucose readings over the last 3 days with meals marked" />
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">No readings in the last 3 days.</p>
          )}
        </Card>
      )}

      <Card>
        <h2 className="font-display text-xl font-semibold">Recent readings</h2>
        {readings.length === 0 ? (
          <p className="mt-1 text-sm text-muted">No readings yet.</p>
        ) : (
          <ul className="mt-2 max-h-96 divide-y divide-line overflow-y-auto text-sm">
            {readings.slice(0, 200).map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2">
                <span className="text-muted">{new Date(r.measured_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} · {r.source}</span>
                <span className={`tabular text-base font-semibold ${r.value < low ? "text-saffron-ink" : r.value > high ? "text-terracotta" : ""}`}>{r.value} mg/dL</span>
              </li>
            ))}
          </ul>
        )}
        {readings.length > 200 && <p className="mt-2 text-xs text-muted">Showing the latest 200.</p>}
      </Card>
    </>
  );
}
