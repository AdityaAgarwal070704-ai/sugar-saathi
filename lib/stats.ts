import type { PairedMeal } from "./pairing";
import type { Food, MealRow, MealType, Profile, ReadingRow } from "./types";

export type DishRise = { foodId: string; name: string; meals: number; avgRise: number };

export type WeekStats = {
  days: number; // days with at least one meal
  meals: number;
  avgDailyCarbs: number;
  avgMealCarbs: number;
  mealsOverTarget: number;
  avgFibre: number;
  avgProtein: number;
  pairedMeals: number;
  avgRise: number | null;
  biggestRises: { text: string; rise: number; carbs: number; eaten_at: string }[];
  dishRises: DishRise[]; // dishes seen in 2+ meals with a measured rise
  byMealType: Partial<Record<MealType, { meals: number; avgCarbs: number; avgRise: number | null }>>;
  readings: number;
  inRangePct: number | null;
};

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const round = (n: number) => Math.round(n);

export function weekStats(meals: PairedMeal<MealRow>[], readings: ReadingRow[], profile: Pick<Profile, "meal_carb_target" | "glucose_low" | "glucose_high">, foods: Food[]): WeekStats {
  const dayKeys = new Set(meals.map((m) => new Date(m.eaten_at).toDateString()));
  const rises = meals.filter((m) => m.rise !== null);

  const perDish = new Map<string, number[]>();
  for (const m of rises) {
    for (const id of new Set(m.items.map((i) => i.foodId))) {
      perDish.set(id, [...(perDish.get(id) ?? []), m.rise as number]);
    }
  }
  const dishRises: DishRise[] = [...perDish.entries()]
    .filter(([, r]) => r.length >= 2)
    .map(([foodId, r]) => ({
      foodId,
      name: foods.find((f) => f.id === foodId)?.name ?? foodId,
      meals: r.length,
      avgRise: round(avg(r)),
    }))
    .sort((a, b) => b.avgRise - a.avgRise);

  const byMealType: WeekStats["byMealType"] = {};
  for (const type of ["breakfast", "lunch", "dinner", "snack"] as MealType[]) {
    const ms = meals.filter((m) => m.meal_type === type);
    if (ms.length === 0) continue;
    const r = ms.filter((m) => m.rise !== null).map((m) => m.rise as number);
    byMealType[type] = { meals: ms.length, avgCarbs: round(avg(ms.map((m) => m.carbs))), avgRise: r.length ? round(avg(r)) : null };
  }

  const inRange = readings.filter((r) => r.value >= profile.glucose_low && r.value <= profile.glucose_high).length;

  return {
    days: dayKeys.size,
    meals: meals.length,
    avgDailyCarbs: dayKeys.size ? round(meals.reduce((a, m) => a + m.carbs, 0) / dayKeys.size) : 0,
    avgMealCarbs: round(avg(meals.map((m) => m.carbs))),
    mealsOverTarget: meals.filter((m) => m.carbs > profile.meal_carb_target * 1.2).length,
    avgFibre: Math.round(avg(meals.map((m) => m.fibre)) * 10) / 10,
    avgProtein: Math.round(avg(meals.map((m) => m.protein)) * 10) / 10,
    pairedMeals: rises.length,
    avgRise: rises.length ? round(avg(rises.map((m) => m.rise as number))) : null,
    biggestRises: [...rises]
      .sort((a, b) => (b.rise as number) - (a.rise as number))
      .slice(0, 3)
      .map((m) => ({ text: m.text, rise: m.rise as number, carbs: m.carbs, eaten_at: m.eaten_at })),
    dishRises,
    byMealType,
    readings: readings.length,
    inRangePct: readings.length ? round((inRange / readings.length) * 100) : null,
  };
}
