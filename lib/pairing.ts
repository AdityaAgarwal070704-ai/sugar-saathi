import type { MealRow, ReadingRow } from "./types";

const MIN = 60_000;

export type PairedMeal = MealRow & {
  pre: ReadingRow | null;
  post: ReadingRow | null;
  rise: number | null;
};

function closest(readings: ReadingRow[], target: number, from: number, to: number): ReadingRow | null {
  let best: ReadingRow | null = null;
  let bestGap = Infinity;
  for (const r of readings) {
    const t = new Date(r.measured_at).getTime();
    if (t < from || t > to) continue;
    const gap = Math.abs(t - target);
    if (gap < bestGap) {
      best = r;
      bestGap = gap;
    }
  }
  return best;
}

// Fixed, auditable windows: pre-meal = within 45 min before to 10 min after eating;
// post-meal = 90 to 150 min after eating, nearest to 2 hours.
export function pairMeals(meals: MealRow[], readings: ReadingRow[]): PairedMeal[] {
  return meals.map((meal) => {
    const eaten = new Date(meal.eaten_at).getTime();
    const pre = closest(readings, eaten, eaten - 45 * MIN, eaten + 10 * MIN);
    const post = closest(readings, eaten + 120 * MIN, eaten + 90 * MIN, eaten + 150 * MIN);
    return { ...meal, pre, post, rise: pre && post ? post.value - pre.value : null };
  });
}
