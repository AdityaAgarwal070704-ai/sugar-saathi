"use client";

import { useMemo } from "react";
import { useStore } from "./store";
import { pairMeals } from "./pairing";
import { nowMs } from "./time";

// The user's meals and readings from the last `days` days, with meals paired to their glucose readings.
export function useRecent(days: number) {
  const store = useStore();
  const { meals, readings } = store;
  return useMemo(() => {
    const cut = nowMs() - days * 86400_000;
    const m = meals.filter((x) => new Date(x.eaten_at).getTime() >= cut);
    const r = readings.filter((x) => new Date(x.measured_at).getTime() >= cut - 3600_000);
    return { ...store, meals: m, readings: r, paired: pairMeals(m, r) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meals, readings, days, store.profile, store.ready]);
}
