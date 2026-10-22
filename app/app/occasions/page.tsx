"use client";

import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { IFTAR_IDS, piecesWithin, SEHRI_IDS, SWEET_BUDGET_DEFAULT } from "@/lib/occasions";
import { useFoods } from "@/lib/useFoods";
import type { Food } from "@/lib/types";

type Tab = "vrat" | "ramzan" | "festival";
const TABS: { key: Tab; label: string }[] = [{ key: "vrat", label: "🪔 Vrat / Navratri" }, { key: "ramzan", label: "🌙 Ramzan" }, { key: "festival", label: "🎉 Festival sweets" }];

function FoodList({ items }: { items: Food[] }) {
  return (
    <ul className="divide-y divide-line text-sm">
      {items.map((d) => (
        <li key={d.id} className="flex items-center justify-between gap-3 py-2">
          <span><span aria-hidden="true">{d.icon}</span> {d.name} <span className="text-muted">per {d.unit}</span></span>
          <span className="tabular shrink-0 font-semibold">{d.carbs} g <span className="font-normal text-muted">· {d.protein} g protein · {d.fibre} g fibre</span></span>
        </li>
      ))}
    </ul>
  );
}

const SAFETY = (
  <Card tone="saffron">
    <h2 className="font-display text-lg font-semibold">Before you fast</h2>
    <p className="mt-1 text-sm">Fasting can change what your body needs when you have diabetes. Please talk to your doctor or diabetes educator well before you start, including about your medicines and what to do if you feel unwell.</p>
  </Card>
);

export default function Occasions() {
  const foods = useFoods();
  const [tab, setTab] = useState<Tab>("vrat");
  const [budget, setBudget] = useState(String(SWEET_BUDGET_DEFAULT));
  const pick = (ids: string[]) => ids.map((id) => foods.find((f) => f.id === id)).filter((f): f is Food => Boolean(f));
  const b = Number(budget);
  const budgetOk = Number.isFinite(b) && b >= 5 && b <= 150;
  const sweets = foods.filter((f) => f.tags.includes("festival") && (f.category === "sweet" || f.category === "snack")).sort((x, y) => x.carbs - y.carbs);

  return (
    <>
      <div>
        <Link href="/app/discover" className="text-sm font-medium text-moss underline">← Discover</Link>
        <h1 className="mt-2 font-display text-3xl font-semibold">Fasting and festivals</h1>
        <p className="mt-1 text-muted">Enjoy the occasion with a plan.</p>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Occasion">
        {TABS.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key} type="button" onClick={() => setTab(t.key)} className={`min-h-11 rounded-full px-4 text-sm font-medium ${tab === t.key ? "bg-moss text-white" : "border border-line bg-paper hover:bg-sand"}`}>{t.label}</button>
        ))}
      </div>

      {tab === "vrat" && (
        <>
          {SAFETY}
          <Card>
            <h2 className="font-display text-xl font-semibold">Vrat foods</h2>
            <p className="mb-2 text-sm text-muted">Sabudana, potato and sweets are quick carbs. Pairing them with curd, nuts or paneer, and keeping portions modest, makes a gentler plate.</p>
            <FoodList items={foods.filter((f) => f.tags.includes("vrat")).sort((x, y) => x.carbs - y.carbs)} />
          </Card>
        </>
      )}

      {tab === "ramzan" && (
        <>
          {SAFETY}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <h2 className="font-display text-xl font-semibold">🌅 Sehri ideas</h2>
              <p className="mb-2 text-sm text-muted">Protein and fibre keep you fuller for longer.</p>
              <FoodList items={pick(SEHRI_IDS)} />
            </Card>
            <Card>
              <h2 className="font-display text-xl font-semibold">🌙 Iftar ideas</h2>
              <p className="mb-2 text-sm text-muted">Many people start with dates and water, then a balanced plate with dal, sabzi and protein before sweets.</p>
              <FoodList items={pick(IFTAR_IDS)} />
            </Card>
          </div>
        </>
      )}

      {tab === "festival" && (
        <>
          <Card>
            <h2 className="font-display text-xl font-semibold">Your sweet budget</h2>
            <p className="mb-3 text-sm text-muted">Decide how many carbs to set aside for sweets, then see how many pieces fit.</p>
            <label className="text-sm font-medium">Carbs for sweets today (g)
              <input inputMode="numeric" value={budget} onChange={(e) => setBudget(e.target.value)} className="ml-2 min-h-11 w-24 rounded-xl border border-line bg-cream px-3" />
            </label>
            {!budgetOk && <p role="alert" className="mt-2 text-sm text-terracotta">Pick a number between 5 and 150.</p>}
            {budgetOk && (
              <ul className="mt-3 divide-y divide-line text-sm">
                {sweets.map((d) => {
                  const n = piecesWithin(d.carbs, b);
                  return (
                    <li key={d.id} className="flex items-center justify-between gap-3 py-2">
                      <span><span aria-hidden="true">{d.icon}</span> {d.name} <span className="text-muted">({d.carbs} g each)</span></span>
                      <span className={`tabular shrink-0 font-semibold ${n === 0 ? "text-terracotta" : ""}`}>{n === 0 ? "none fit" : `${n} piece${n === 1 ? "" : "s"}`}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
          <Card tone="sand">
            <h2 className="font-display text-lg font-semibold">Festival tips</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              <li>Pick one or two favourites instead of tasting everything.</li>
              <li>Have sweets after a balanced meal, not on an empty stomach.</li>
              <li>A short walk afterwards is a habit many people find helpful. Ask your doctor what suits you.</li>
              <li>Log it in Sugar Saathi, so you can see what it did to you and plan the next one.</li>
            </ul>
          </Card>
        </>
      )}
      <p className="text-xs text-muted">Estimates from a starter food table, not medical advice.</p>
    </>
  );
}
