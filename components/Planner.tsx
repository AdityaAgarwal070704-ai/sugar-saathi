"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";

type Plan = {
  meals: {
    slot: string;
    note: string;
    items: { name: string; icon: string; unit: string; count: number; carbs: number }[];
    nutrition: { carbs: number; fibre: number; protein: number; fat: number; kcal: number; gl: number };
    overTarget: boolean;
  }[];
  carbTarget: number;
};

const SLOT_EMOJI: Record<string, string> = { breakfast: "🌅", lunch: "☀️", snack: "🍵", dinner: "🌙" };

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

  const input = "min-h-11 rounded-xl border border-line bg-cream px-3";
  const total = plan?.meals.reduce((a, m) => a + m.nutrition.carbs, 0) ?? 0;
  const kcal = plan?.meals.reduce((a, m) => a + m.nutrition.kcal, 0) ?? 0;

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-end gap-4 text-sm">
          <label className="block">Carb goal per meal (g)<br /><input inputMode="numeric" className={`${input} mt-1 w-24`} value={target} onChange={(e) => setTarget(e.target.value)} /></label>
          <label className="block">Diet<br /><select className={`${input} mt-1`} value={diet} onChange={(e) => setDiet(e.target.value as typeof diet)}>
            <option value="veg">Vegetarian</option><option value="egg">Vegetarian + egg</option><option value="nonveg">Non-vegetarian</option>
          </select></label>
          <label className="flex min-h-11 items-center gap-2"><input type="checkbox" className="h-5 w-5" checked={snacks} onChange={(e) => setSnacks(e.target.checked)} /> Include a snack</label>
          <Button disabled={busy} onClick={run}>{busy ? "Planning your day…" : plan ? "Make another plan" : "Plan my day"}</Button>
        </div>
        {error && <p role="alert" className="mt-3 rounded-2xl bg-terracotta-soft px-4 py-2 text-sm text-terracotta">{error}</p>}
      </Card>

      {plan && (
        <>
          <p className="text-sm text-muted">Day total: about <strong className="text-ink">{total} g</strong> carbs and <strong className="text-ink">{kcal}</strong> kcal. Every number below is calculated from the food table, not by the AI.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {plan.meals.map((m) => (
              <Card key={m.slot} className="rise-in">
                <h2 className="font-display text-xl font-semibold capitalize">{SLOT_EMOJI[m.slot] ?? "🍽️"} {m.slot}</h2>
                <ul className="mt-2 space-y-1 text-sm">
                  {m.items.map((i) => <li key={i.name}><span aria-hidden="true">{i.icon}</span> {i.count} {i.unit}{i.count === 1 ? "" : "s"} {i.name} <span className="text-muted">({i.carbs} g)</span></li>)}
                </ul>
                <p className="tabular mt-3 text-sm"><strong>{m.nutrition.carbs} g</strong> carbs · {m.nutrition.protein} g protein · {m.nutrition.fibre} g fibre · {m.nutrition.kcal} kcal</p>
                {m.overTarget && <Pill tone="warn" className="mt-2">A bit above your goal</Pill>}
                {m.note && <p className="mt-2 text-xs text-muted">{m.note}</p>}
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted">Meal ideas to discuss with your educator or doctor, not a prescribed diet.</p>
        </>
      )}
    </div>
  );
}
