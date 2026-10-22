"use client";

import CsvImport from "@/components/CsvImport";
import GlucoseQuickAdd from "@/components/GlucoseQuickAdd";
import { useRecent } from "@/lib/useRecent";

export default function GlucosePage() {
  const { ready, readings, profile } = useRecent(365);
  if (!ready) return <p className="text-zinc-500">Loading…</p>;
  const { glucose_low: low, glucose_high: high } = profile;

  return (
    <>
      <h1 className="text-2xl font-bold">Glucose</h1>
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="font-semibold">Add a reading</h2>
        <p className="mb-2 text-sm text-zinc-600">Sugar Saathi never makes up readings. It only uses values you enter or import.</p>
        <GlucoseQuickAdd />
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="font-semibold">Import from your CGM or meter</h2>
        <div className="mt-2"><CsvImport /></div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="font-semibold">Recent readings ({readings.length})</h2>
        {readings.length === 0 ? (
          <p className="mt-1 text-sm text-zinc-600">No readings yet.</p>
        ) : (
          <ul className="mt-2 max-h-96 divide-y divide-zinc-100 overflow-y-auto text-sm">
            {readings.slice(0, 200).map((r) => (
              <li key={r.id} className="flex justify-between py-1.5">
                <span className="text-zinc-600">{new Date(r.measured_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} · {r.source}</span>
                <span className={r.value < low ? "font-medium text-amber-700" : r.value > high ? "font-medium text-red-700" : "font-medium"}>{r.value} mg/dL</span>
              </li>
            ))}
          </ul>
        )}
        {readings.length > 200 && <p className="mt-2 text-xs text-zinc-500">Showing the latest 200.</p>}
      </section>
    </>
  );
}
