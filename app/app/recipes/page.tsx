"use client";

import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { store, useStore } from "@/lib/store";

export default function Recipes() {
  const { ready, recipes, customFoods, meals } = useStore();
  if (!ready) return <p className="text-muted">Loading…</p>;

  const del = (id: string, foodId: string, name: string) => {
    const used = meals.filter((m) => m.items.some((i) => i.foodId === foodId)).length;
    const warn = used > 0 ? ` It is used in ${used} logged meal${used === 1 ? "" : "s"}; those keep their saved carbs but lose fat and calories.` : "";
    if (window.confirm(`Delete "${name}"?${warn}`)) store.deleteRecipe(id);
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/app/discover" className="inline-block py-2 text-sm font-medium text-moss underline">← Discover</Link>
          <h1 className="mt-2 font-display text-3xl font-semibold">My dishes</h1>
          <p className="mt-1 text-muted">Home-cooked dishes with nutrition worked out from your own ingredients.</p>
        </div>
        <ButtonLink href="/app/recipes/builder">+ New recipe</ButtonLink>
      </div>

      {recipes.length === 0 ? (
        <EmptyState title="No dishes yet" action={<ButtonLink href="/app/recipes/builder">Build your first recipe</ButtonLink>}>
          Cook without measuring? List your ingredients once, say how many it serves, and log the dish in one tap from then on.
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {recipes.map((r) => {
            const f = customFoods.find((x) => x.id === r.foodId);
            return (
              <Card key={r.id}>
                <p className="text-3xl" aria-hidden="true">{r.icon}</p>
                <h2 className="mt-1 font-display text-xl font-semibold">{r.name}</h2>
                {f && <p className="tabular mt-1 text-sm text-muted"><strong className="text-ink">{f.carbs} g</strong> carbs · {f.protein} g protein · {f.fibre} g fibre · {f.fat} g fat per serving (makes {r.servings})</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  <ButtonLink href={`/app/log?dish=${r.foodId}`} size="sm">Log a serving</ButtonLink>
                  <ButtonLink href={`/app/recipes/builder?id=${r.id}`} size="sm" variant="outline">Edit</ButtonLink>
                  <button type="button" onClick={() => del(r.id, r.foodId, r.name)} className="min-h-9 rounded-full px-3 text-sm text-terracotta hover:bg-terracotta-soft">Delete</button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
