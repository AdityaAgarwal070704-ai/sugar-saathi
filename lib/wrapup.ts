import { mealTips } from "./insights";
import type { EnrichedMeal } from "./enrich";
import type { Food, Profile, ReadingRow } from "./types";

export type WrapUp = { lines: string[]; good: string | null; idea: string | null };

// An evening summary of the day, rule-based. Kind, specific, and never medical advice.
export function dayWrapUp(meals: EnrichedMeal[], foods: Food[], profile: Pick<Profile, "meal_carb_target" | "glucose_low" | "glucose_high">, readings: Pick<ReadingRow, "value">[]): WrapUp {
  const budget = profile.meal_carb_target * 3;
  const carbs = meals.reduce((a, m) => a + m.carbs, 0);
  const protein = Math.round(meals.reduce((a, m) => a + m.protein, 0));
  const fibre = Math.round(meals.reduce((a, m) => a + m.fibre, 0));
  const lines = [`${meals.length} meal${meals.length === 1 ? "" : "s"} logged: ${carbs} g carbs of your ${budget} g budget, ${protein} g protein, ${fibre} g fibre.`];

  if (readings.length >= 2) {
    const inRange = readings.filter((r) => r.value >= profile.glucose_low && r.value <= profile.glucose_high).length;
    lines.push(`${inRange} of ${readings.length} readings were in your range.`);
  }

  const tips = meals.map((m) => ({ m, t: mealTips(m.items, foods, profile) }));
  const best = [...tips].sort((a, b) => a.m.gl - b.m.gl).find((x) => x.t.good.length > 0);
  const worst = [...tips].sort((a, b) => b.m.gl - a.m.gl).find((x) => x.t.improve.length > 0);
  const swap = [...tips].flatMap((x) => x.t.swaps).sort((a, b) => b.saves - a.saves)[0];

  const good = best ? `${best.t.good[0]}` : carbs <= budget ? "You stayed within your carb budget today." : null;
  const idea = swap
    ? `You could try ${swap.to.toLowerCase()} instead of ${swap.from.toLowerCase()} (saves about ${swap.saves} g carbs).`
    : worst
      ? worst.t.improve[0]
      : fibre < 15
        ? "Try adding a salad or an extra sabzi for more fibre."
        : null;
  return { lines, good, idea };
}
