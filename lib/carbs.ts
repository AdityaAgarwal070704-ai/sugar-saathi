import type { Food, Item, SavedItem } from "./types";

// Carbs for one line, or null when the dish isn't in the table.
// The AI never supplies numbers: this file is the only place nutrition is calculated.
export function itemCarbs(item: Pick<Item, "foodId" | "count">, foods: Food[]): number | null {
  if (item.foodId === null) return null;
  const food = foods.find((f) => f.id === item.foodId);
  if (!food) return null;
  return Math.round(food.carbs * item.count);
}

export function totalCarbs(items: Item[], foods: Food[]) {
  let grams = 0;
  let counted = 0;
  let skipped = 0;
  for (const item of items) {
    const c = itemCarbs(item, foods);
    if (c === null) skipped++;
    else {
      grams += c;
      counted++;
    }
  }
  return { grams, counted, skipped };
}

export type Nutrition = { carbs: number; fibre: number; protein: number; gl: number };

// Totals for a list of saved lines. Glycemic load = GI x carbs / 100, summed per dish.
export function nutritionOf(items: Pick<SavedItem, "foodId" | "count">[], foods: Food[]): Nutrition {
  const n = { carbs: 0, fibre: 0, protein: 0, gl: 0 };
  for (const it of items) {
    const f = foods.find((x) => x.id === it.foodId);
    if (!f) continue;
    const carbs = f.carbs * it.count;
    n.carbs += carbs;
    n.fibre += f.fibre * it.count;
    n.protein += f.protein * it.count;
    n.gl += (f.gi * carbs) / 100;
  }
  return {
    carbs: Math.round(n.carbs),
    fibre: Math.round(n.fibre * 10) / 10,
    protein: Math.round(n.protein * 10) / 10,
    gl: Math.round(n.gl),
  };
}
