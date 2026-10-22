import { EN, mealTips, type Loc } from "./insights";
import type { EnrichedMeal } from "./enrich";
import type { Food, Profile, ReadingRow } from "./types";

export type WrapUp = { lines: string[]; good: string | null; idea: string | null };

// An evening summary of the day, rule-based. Kind, specific, and never medical advice.
export function dayWrapUp(meals: EnrichedMeal[], foods: Food[], profile: Pick<Profile, "meal_carb_target" | "glucose_low" | "glucose_high">, readings: Pick<ReadingRow, "value">[], loc: Loc = EN): WrapUp {
  const { t } = loc;
  const budget = profile.meal_carb_target * 3;
  const carbs = meals.reduce((a, m) => a + m.carbs, 0);
  const protein = Math.round(meals.reduce((a, m) => a + m.protein, 0));
  const fibre = Math.round(meals.reduce((a, m) => a + m.fibre, 0));
  const lines = [t("wrap.meals", { n: meals.length, c: carbs, b: budget, p: protein, f: fibre })];

  if (readings.length >= 2) {
    const inRange = readings.filter((r) => r.value >= profile.glucose_low && r.value <= profile.glucose_high).length;
    lines.push(t("wrap.readings", { a: inRange, b: readings.length }));
  }

  const tips = meals.map((m) => ({ m, t: mealTips(m.items, foods, profile, loc) }));
  const best = [...tips].sort((a, b) => a.m.gl - b.m.gl).find((x) => x.t.good.length > 0);
  const worst = [...tips].sort((a, b) => b.m.gl - a.m.gl).find((x) => x.t.improve.length > 0);
  const swap = [...tips].flatMap((x) => x.t.swaps).sort((a, b) => b.saves - a.saves)[0];

  const good = best ? `${best.t.good[0]}` : carbs <= budget ? t("wrap.stayed") : null;
  const idea = swap
    ? t("wrap.swapIdea", { to: swap.to.toLowerCase(), from: swap.from.toLowerCase(), n: swap.saves })
    : worst
      ? worst.t.improve[0]
      : fibre < 15
        ? t("wrap.fibreIdea")
        : null;
  return { lines, good, idea };
}
