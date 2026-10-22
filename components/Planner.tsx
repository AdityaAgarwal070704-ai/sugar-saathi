"use client";

import { useState } from "react";

type Plan = {
  meals: {
    slot: string;
    note: string;
    items: { name: string; unit: string; count: number; carbs: number }[];
    nutrition: { carbs: number; fibre: number; protein: number; gl: number };
    overTarget: boolean;
  }[];
  carbTarget: number;
};

export default function Planner({ defaultTarget, defaultDiet }: { defaultTarget: number; defaultDiet: "veg" | "nonveg" | "egg" }) {
  const [target, setTarget] = useState(String(defaultTarget));
  const [diet, setDiet] = useState(defaultDiet);
  const [snacks, setSnacks] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);

  const run = async () => {
    const t = Number(target);
    if (!Number.isFinite(t) || t < 20 || t > 150) return setError("Pick a per-meal carb goal between 20 and 150 g.");
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ carbTarget: t, diet, snacks }) });
      const data = await res.json().catch(() => null);
      if (!res.ok) return setError(data?.error ?? "Couldn't reach the AI, try again.");
      setPlan(data as Plan);
    } catch {
      setError("Couldn't reach the AI, try again.");
    } finally {
      setBusy(false);
    }
  };

  const input = "rounded border border-zinc-300 px-2 py-1";
  const dayTotal = plan?.meals.reduce((a, m) => a + m.nutrition.carbs, 0) ?? 0;

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex flex-wrap items-end gap-4 text-sm">
          <label>Carb goal per meal (g) <input inputMode="numeric" className={`${input} ml-1 w-20`} value={target} onChange={(e) => setTarget(e.target.value)} /></label>
          <label>Diet <select className={`${input} ml-1`} value={diet} onChange={(e) => setDiet(e.target.value as typeof diet)}>
            <option value="veg">Vegetarian</option><option value="egg">Vegetarian + egg</option><option value="nonveg">Non-vegetarian</option>
          </select></label>
          <label className="flex items-center gap-1"><input type="checkbox" checked={snacks} onChange={(e) => setSnacks(e.target.checked)} /> Include a snack</label>
          <button type="button" disabled={busy} onClick={run} className="rounded-lg bg-emerald-700 px-4 py-2 text-white disabled:opacity-50">{busy ? "Planning…" : plan ? "New plan" : "Plan my day"}</button>
        </div>
        {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
      </section>

      {plan && (
        <>
          <p className="text-sm text-zinc-700">Day total: about <strong>{dayTotal} g</strong> carbs. Every number below is calculated from the food table, not by the AI.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {plan.meals.map((m) => (
              <section key={m.slot} className="rounded-xl border border-zinc-200 bg-white p-4">
                <h2 className="font-semibold capitalize">{m.slot}</h2>
                <ul className="mt-1 text-sm text-zinc-800">
                  {m.items.map((i) => <li key={i.name}>{i.count} {i.unit}{i.count === 1 ? "" : "s"} {i.name} <span className="text-zinc-500">({i.carbs} g)</span></li>)}
                </ul>
                <p className="mt-2 text-sm"><strong>{m.nutrition.carbs} g</strong> carbs · fibre {m.nutrition.fibre} g · protein {m.nutrition.protein} g</p>
                {m.overTarget && <p className="text-xs text-amber-800">A bit above your goal. Try a smaller portion of the main carb.</p>}
                {m.note && <p className="mt-1 text-xs text-zinc-600">{m.note}</p>}
              </section>
            ))}
          </div>
          <p className="text-xs text-zinc-500">Meal ideas to discuss with your educator or doctor, not a prescribed diet.</p>
        </>
      )}
    </div>
  );
}
