"use client";

import { useMemo } from "react";
import { FOODS } from "./foods-client";
import { useStore } from "./store";
import type { Food } from "./types";

// The built-in food table plus the user's own dishes from the recipe builder.
export function useFoods(): Food[] {
  const { customFoods } = useStore();
  return useMemo(() => (customFoods.length ? [...customFoods, ...FOODS] : FOODS), [customFoods]);
}
