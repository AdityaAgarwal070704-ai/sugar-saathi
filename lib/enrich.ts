import { nutritionOf } from "./carbs";
import type { Food, MealRow } from "./types";

// A meal with fat and calories, recomputed from its dishes using the current food table, so improvements to the
// table (or older meals saved before fat existed) are reflected everywhere.
export type EnrichedMeal = MealRow & { fat: number; kcal: number };

export function enrichMeal(m: MealRow, foods: Food[]): EnrichedMeal {
  const known = m.items.length > 0 && m.items.every((i) => foods.some((f) => f.id === i.foodId));
  if (known) {
    const n = nutritionOf(m.items, foods);
    return { ...m, carbs: n.carbs, fibre: n.fibre, protein: n.protein, gl: n.gl, fat: n.fat, kcal: n.kcal };
  }
  return { ...m, fat: 0, kcal: Math.round(4 * m.carbs + 4 * m.protein) };
}
