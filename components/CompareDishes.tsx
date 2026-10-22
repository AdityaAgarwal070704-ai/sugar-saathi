"use client";

import { useState } from "react";
import { DishPicker } from "@/components/ui/DishPicker";
import { Card } from "@/components/ui/Card";
import { useFoods } from "@/lib/useFoods";
import type { Food } from "@/lib/types";

const ROWS: { label: string; get: (f: Food) => number; lowerIsBetter?: boolean; unit: string }[] = [
  { label: "Carbs", get: (f) => f.carbs, lowerIsBetter: true, unit: "g" },
  { label: "Protein", get: (f) => f.protein, unit: "g" },
  { label: "Fibre", get: (f) => f.fibre, unit: "g" },
  { label: "Fat", get: (f) => f.fat, lowerIsBetter: true, unit: "g" },
  { label: "Calories", get: (f) => Math.round(4 * f.carbs + 4 * f.protein + 9 * f.fat), lowerIsBetter: true, unit: "kcal" },
  { label: "Glycemic load", get: (f) => Math.round((f.gi * f.carbs) / 100), lowerIsBetter: true, unit: "" },
];

export default function CompareDishes({ defaultA = "naan", defaultB = "roti" }: { defaultA?: string; defaultB?: string }) {
  const foods = useFoods();
  const [a, setA] = useState(defaultA);
  const [b, setB] = useState(defaultB);
  const fa = foods.find((f) => f.id === a);
  const fb = foods.find((f) => f.id === b);
  return (
    <Card>
      <h2 className="font-display text-xl font-semibold">Compare two dishes</h2>
      <p className="mb-3 text-sm text-muted">Per one portion of each (one piece, katori or serving).</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <DishPicker foods={foods} value={a} onChange={setA} triggerClassName="w-full" />
        <DishPicker foods={foods} value={b} onChange={setB} triggerClassName="w-full" />
      </div>
      {fa && fb && (
        <table className="mt-4 w-full text-sm">
          <caption className="sr-only">Nutrition comparison</caption>
          <thead>
            <tr className="text-left text-muted"><th className="py-1 font-normal"> </th><th className="py-1 font-medium text-ink">{fa.icon} per {fa.unit}</th><th className="py-1 font-medium text-ink">{fb.icon} per {fb.unit}</th></tr>
          </thead>
          <tbody>
            {ROWS.map((r) => {
              const va = r.get(fa), vb = r.get(fb);
              const better = va === vb ? null : (va < vb) === Boolean(r.lowerIsBetter) ? "a" : "b";
              return (
                <tr key={r.label} className="border-t border-line">
                  <th scope="row" className="py-2 text-left font-normal text-muted">{r.label}</th>
                  <td className={`tabular py-2 ${better === "a" ? "font-semibold text-leaf" : ""}`}>{va} {r.unit}</td>
                  <td className={`tabular py-2 ${better === "b" ? "font-semibold text-leaf" : ""}`}>{vb} {r.unit}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <p className="mt-2 text-xs text-muted">Green marks the gentler choice on that row (fewer carbs, fat, calories or glycemic load; more protein or fibre).</p>
    </Card>
  );
}
