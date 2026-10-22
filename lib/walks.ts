import type { PairedMeal } from "./pairing";
import type { Walk } from "./types";

// Did a walk start within an hour after this meal?
export function walkedAfter(mealIso: string, walks: Pick<Walk, "started_at">[]): boolean {
  const t = new Date(mealIso).getTime();
  return walks.some((w) => {
    const s = new Date(w.started_at).getTime();
    return s >= t && s <= t + 60 * 60_000;
  });
}

export type WalkEffect = { withWalk: { n: number; avgRise: number }; without: { n: number; avgRise: number } };

const avg = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);

// Compares the average rise for meals followed by a walk with meals that were not, using only meals that have a
// measured rise. Needs at least 3 of each. This is a possible link, never a proven effect.
export function walkEffect(meals: Pick<PairedMeal, "eaten_at" | "rise">[], walks: Pick<Walk, "started_at">[], minEach = 3): WalkEffect | null {
  const yes: number[] = [];
  const no: number[] = [];
  for (const m of meals) {
    if (m.rise === null) continue;
    (walkedAfter(m.eaten_at, walks) ? yes : no).push(m.rise);
  }
  if (yes.length < minEach || no.length < minEach) return null;
  return { withWalk: { n: yes.length, avgRise: avg(yes) }, without: { n: no.length, avgRise: avg(no) } };
}
