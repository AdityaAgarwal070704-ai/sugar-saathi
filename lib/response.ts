import type { PairedMeal } from "./pairing";
import type { MealType } from "./types";

// "Expected change in your sugar", learned ONLY from the user's own past meals that have a measured rise.
// It is a range with the number of meals behind it, never a single predicted number, and never shown
// without enough data.
export const MIN_SIMILAR_MEALS = 3;

export type ExpectedRise =
  | { status: "insufficient"; found: number; needed: number }
  | { status: "ok"; low: number; high: number; median: number; n: number; sameMealType: boolean };

function quantile(sorted: number[], q: number) {
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

const round5 = (n: number) => Math.round(n / 5) * 5;

export function expectedRise(
  meal: { carbs: number; meal_type?: MealType; id?: string },
  history: PairedMeal[],
): ExpectedRise {
  const tolerance = Math.max(10, meal.carbs * 0.25);
  const similar = history.filter((m) => m.rise !== null && m.id !== meal.id && Math.abs(m.carbs - meal.carbs) <= tolerance);

  // Prefer meals of the same type (a breakfast and a dinner can behave differently), if there are enough of them.
  const sameType = meal.meal_type ? similar.filter((m) => m.meal_type === meal.meal_type) : [];
  const pool = sameType.length >= MIN_SIMILAR_MEALS ? sameType : similar;

  if (pool.length < MIN_SIMILAR_MEALS) return { status: "insufficient", found: pool.length, needed: MIN_SIMILAR_MEALS };

  const rises = pool.map((m) => m.rise as number).sort((a, b) => a - b);
  return {
    status: "ok",
    low: round5(quantile(rises, 0.25)),
    high: round5(quantile(rises, 0.75)),
    median: round5(quantile(rises, 0.5)),
    n: pool.length,
    sameMealType: pool === sameType,
  };
}
