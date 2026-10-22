"use client";

import { useMemo } from "react";
import { enrichMeal } from "./enrich";
import { FOODS } from "./foods-client";
import { pairMeals } from "./pairing";
import { useStore } from "./store";
import { nowMs } from "./time";

// The user's meals and readings from the last `days` days, with meals recomputed from the food table
// (carbs, protein, fibre, fat, calories) and paired to their glucose readings.
export function useRecent(days: number) {
  const store = useStore();
  const { meals, readings, ready, customFoods } = store;
  return useMemo(() => {
    const cut = nowMs() - days * 86400_000;
    const m = meals.filter((x) => new Date(x.eaten_at).getTime() >= cut).map((x) => enrichMeal(x, customFoods.length ? [...customFoods, ...FOODS] : FOODS));
    const r = readings.filter((x) => new Date(x.measured_at).getTime() >= cut - 3600_000);
    return { ...store, foods: customFoods.length ? [...customFoods, ...FOODS] : FOODS, meals: m, readings: r, paired: pairMeals(m, r) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meals, readings, days, store.profile, ready, customFoods]);
}
