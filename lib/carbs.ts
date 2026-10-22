import type { Food, Item } from "./types";

// Carbs for one line, or null when the dish isn't in the table.
// Claude never supplies numbers: this is the only place carbs are calculated.
export function itemCarbs(item: Item, foods: Food[]): number | null {
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
