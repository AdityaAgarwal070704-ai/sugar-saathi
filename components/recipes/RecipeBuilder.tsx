"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { ParsedRecipe } from "@/app/api/parse-recipe/route";
import { IngredientPicker } from "@/components/recipes/IngredientPicker";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CloseIcon } from "@/components/ui/icons";
import { MacroRing } from "@/components/ui/MacroRing";
import { INGREDIENTS } from "@/lib/ingredients-client";
import { MAX_GRAMS, MAX_SERVINGS, recipeNutrition, recipeToFood, unitsFor, type RecipeLine, type Unit } from "@/lib/recipe";
import { store, useStore } from "@/lib/store";
import type { Category } from "@/lib/types";

type Line = { key: string; ingredientId: string | null; amount: string; unit: Unit; typed?: string };

const KINDS: { label: string; category: Category; icon: string }[] = [
  { label: "Roti or bread", category: "grain", icon: "🫓" },
  { label: "Rice or one-pot meal", category: "grain", icon: "🍛" },
  { label: "Dal or legumes", category: "dal", icon: "🍲" },
  { label: "Sabzi or vegetables", category: "veg", icon: "🥘" },
  { label: "Paneer, egg or meat dish", category: "protein", icon: "🍳" },
  { label: "Snack", category: "snack", icon: "🥟" },
  { label: "Sweet", category: "sweet", icon: "🍮" },
  { label: "Drink", category: "drink", icon: "🥛" },
  { label: "Something else", category: "extra", icon: "🍽️" },
];

const newLine = (): Line => ({ key: crypto.randomUUID(), ingredientId: null, amount: "", unit: "g" });

export default function RecipeBuilder() {
  const router = useRouter();
  const params = useSearchParams();
  const { recipes } = useStore();
  const editing = recipes.find((r) => r.id === params.get("id")) ?? null;

  const [name, setName] = useState(editing?.name ?? "");
  const [servings, setServings] = useState(String(editing?.servings ?? 4));
  const [kind, setKind] = useState(Math.max(0, KINDS.findIndex((k) => k.category === editing?.category && k.icon === editing?.icon)) || (editing ? 0 : 3));
  const [lines, setLines] = useState<Line[]>(() => editing ? editing.lines.map((l) => ({ key: crypto.randomUUID(), ingredientId: l.ingredientId, amount: String(l.amount), unit: l.unit })) : [newLine()]);
  const [describe, setDescribe] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const complete: RecipeLine[] = lines
    .filter((l) => l.ingredientId !== null && Number(l.amount) > 0)
    .map((l) => ({ ingredientId: l.ingredientId as string, amount: Number(l.amount), unit: l.unit }));
  const sv = Number(servings);
  const result = recipeNutrition(complete, sv, INGREDIENTS);
  const incomplete = lines.filter((l) => !(l.ingredientId !== null && Number(l.amount) > 0)).length;

  const update = (key: string, patch: Partial<Line>) => setLines((cur) => cur.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const fromAi = async () => {
    if (describe.trim() === "") return setAiError("Describe your recipe first.");
    setAiBusy(true);
    setAiError(null);
    try {
      const res = await fetch("/api/parse-recipe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: describe }) });
      const data = (await res.json().catch(() => null)) as (ParsedRecipe & { error?: string }) | null;
      if (!res.ok || !data) return setAiError(data?.error ?? "Couldn't reach the AI, try again.");
      setLines(data.lines.map((l) => ({ key: crypto.randomUUID(), ingredientId: l.ingredientId, amount: String(l.amount), unit: l.unit, typed: l.typed })));
      if (data.servings) setServings(String(data.servings));
      if (data.name && name.trim() === "") setName(data.name);
    } catch {
      setAiError("Couldn't reach the AI, try again.");
    } finally {
      setAiBusy(false);
    }
  };

  const save = () => {
    setError(null);
    const n = name.trim();
    if (n === "") return setError("Give your dish a name.");
    if (n.length > 60) return setError("Please keep the name under 60 characters.");
    if (incomplete > 0 && lines.length > 1) return setError("Finish or remove the ingredient rows that are empty.");
    if (!result.ok) return setError(result.error);
    const k = KINDS[kind];
    const id = editing?.id ?? `r-${crypto.randomUUID().slice(0, 8)}`;
    const foodId = editing?.foodId ?? `my_${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
    const recipe = { id, name: n, servings: sv, lines: complete, foodId, category: k.category, icon: k.icon };
    if (!store.saveRecipe(recipe, recipeToFood(recipe, result.perServing))) return setError("Your browser couldn't save this (storage is full or blocked).");
    router.push("/app/recipes");
  };

  const input = "min-h-11 rounded-xl border border-line bg-cream px-3";
  return (
    <div className="space-y-5">
      <Card tone="sand">
        <h2 className="font-display text-lg font-semibold">✨ Describe it, we&apos;ll fill the list</h2>
        <p className="mb-2 text-sm text-muted">Type what you put in, in your own words. You can fix anything afterwards.</p>
        <textarea rows={3} maxLength={500} value={describe} onChange={(e) => setDescribe(e.target.value)} placeholder="e.g. 1 cup toor dal, 1 onion, 2 tomatoes, 2 tsp oil, haldi and mirch, makes 4 servings" aria-label="Describe your recipe" className="w-full resize-none rounded-2xl border border-line bg-paper p-3 outline-none focus:border-moss" />
        <div className="mt-2 flex items-center gap-3">
          <Button variant="soft" onClick={fromAi} disabled={aiBusy || describe.trim() === ""}>{aiBusy ? "Reading your recipe…" : "Fill ingredients"}</Button>
          {aiError && <p role="alert" className="text-sm text-terracotta">{aiError}</p>}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium">Dish name
            <input value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mummy's rajma" className={`${input} mt-1 w-full`} />
          </label>
          <label className="block text-sm font-medium">What kind of dish?
            <select value={kind} onChange={(e) => setKind(Number(e.target.value))} className={`${input} mt-1 w-full`}>{KINDS.map((k, i) => <option key={k.label} value={i}>{k.icon} {k.label}</option>)}</select>
          </label>
          <label className="block text-sm font-medium">How many servings does it make?
            <input inputMode="numeric" value={servings} onChange={(e) => setServings(e.target.value)} className={`${input} mt-1 w-28`} />
            <span className="mt-1 block text-xs font-normal text-muted">1 to {MAX_SERVINGS}. One serving is what you will log.</span>
          </label>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold">Ingredients (raw)</h2>
          <ul className="mt-2 space-y-3">
            {lines.map((l) => {
              const ing = INGREDIENTS.find((i) => i.id === l.ingredientId);
              return (
                <li key={l.key} className="rounded-2xl border border-line bg-cream p-3">
                  {l.typed && !ing && <p className="mb-1 text-xs text-terracotta">“{l.typed}” wasn&apos;t matched. Pick an ingredient.</p>}
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1"><IngredientPicker ingredients={INGREDIENTS} value={l.ingredientId} onChange={(id) => { const next = INGREDIENTS.find((i) => i.id === id)!; update(l.key, { ingredientId: id, unit: unitsFor(next).includes(l.unit) ? l.unit : "g" }); }} /></div>
                    <button type="button" onClick={() => setLines((c) => (c.length > 1 ? c.filter((x) => x.key !== l.key) : c))} aria-label="Remove ingredient" className="rounded-full p-2 text-muted hover:bg-sand"><CloseIcon className="h-5 w-5" /></button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input inputMode="decimal" value={l.amount} onChange={(e) => update(l.key, { amount: e.target.value })} placeholder="Amount" aria-label="Amount" className={`${input} w-28`} />
                    <select value={l.unit} onChange={(e) => update(l.key, { unit: e.target.value as Unit })} aria-label="Unit" className={input}>
                      {(ing ? unitsFor(ing) : (["g"] as Unit[])).map((u) => <option key={u} value={u}>{u === "g" ? "grams" : u}</option>)}
                    </select>
                    {ing && l.unit !== "g" && Number(l.amount) > 0 && <span className="text-xs text-muted">≈ {Math.round(Number(l.amount) * (ing.units[l.unit as Exclude<Unit, "g">] ?? 0))} g</span>}
                  </div>
                </li>
              );
            })}
          </ul>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setLines((c) => (c.length >= 40 ? c : [...c, newLine()]))}>+ Add ingredient</Button>
          <p className="mt-2 text-xs text-muted">Use the raw weight, before cooking. Max {MAX_GRAMS} g per ingredient. Salt and water add nothing, so skip them.</p>
        </div>
      </Card>

      <Card tone="moss" aria-live="polite">
        <h2 className="font-display text-xl font-semibold">One serving of {name.trim() || "your dish"}</h2>
        {result.ok ? (
          <div className="mt-3 grid grid-cols-[auto_1fr] items-center gap-5">
            <MacroRing carbs={result.perServing.carbs} protein={result.perServing.protein} fat={result.perServing.fat} kcal={result.perServing.kcal} size={112} onDark />
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {[["Carbs", result.perServing.carbs], ["Protein", result.perServing.protein], ["Fibre", result.perServing.fibre], ["Fat", result.perServing.fat]].map(([k, v]) => (
                <div key={k as string}><dt className="text-xs text-white/70">{k}</dt><dd className="tabular text-xl font-semibold">{v} g</dd></div>
              ))}
              <div className="col-span-2 text-xs text-white/70">Glycemic index about {result.perServing.gi}. {result.totalGrams} g raw ingredients in total.</div>
            </dl>
          </div>
        ) : (
          <p className="mt-2 text-white/80">{lines.length === 1 && incomplete === 1 ? "Add ingredients and amounts to see the numbers." : result.error}</p>
        )}
      </Card>

      {error && <p role="alert" className="rounded-2xl bg-terracotta-soft px-4 py-2 text-sm text-terracotta">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button size="lg" onClick={save}>{editing ? "Save changes" : "Save my dish"}</Button>
        <Button size="lg" variant="ghost" onClick={() => router.push("/app/recipes")}>Cancel</Button>
      </div>
      <p className="text-xs text-muted">Totals are added up from the ingredient table (a starter table, not clinically verified) and divided by your servings. Cooking oil and portion sizes in your own kitchen will differ, so treat this as a good estimate.</p>
    </div>
  );
}
