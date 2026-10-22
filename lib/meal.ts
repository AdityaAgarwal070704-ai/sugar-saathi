import type { MealType } from "./types";

export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "snack", "dinner"];

export const MEAL_LABEL: Record<MealType, string> = { breakfast: "Breakfast", lunch: "Lunch", snack: "Snack", dinner: "Dinner" };
export const MEAL_EMOJI: Record<MealType, string> = { breakfast: "🌅", lunch: "☀️", snack: "🍵", dinner: "🌙" };

export function guessMealType(hour: number): MealType {
  if (hour < 11) return "breakfast";
  if (hour < 16) return "lunch";
  if (hour < 19) return "snack";
  return "dinner";
}

export function isMealType(v: unknown): v is MealType {
  return typeof v === "string" && (MEAL_TYPES as string[]).includes(v);
}
