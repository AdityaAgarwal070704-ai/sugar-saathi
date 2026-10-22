import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Food } from "./types";

// Server-only: loads the food table. Returns null if it is missing or malformed, so callers never guess.
export async function loadFoods(): Promise<Food[] | null> {
  try {
    const raw = await readFile(path.join(process.cwd(), "data", "foods.json"), "utf8");
    const foods = JSON.parse(raw).foods;
    if (!Array.isArray(foods) || foods.length === 0) return null;
    for (const f of foods) {
      if (
        typeof f.id !== "string" ||
        typeof f.name !== "string" ||
        typeof f.unit !== "string" ||
        typeof f.category !== "string" ||
        typeof f.icon !== "string" ||
        !Array.isArray(f.tags) ||
        ![f.carbs, f.fibre, f.protein, f.fat, f.gi].every((n) => typeof n === "number")
      ) {
        return null;
      }
    }
    return foods as Food[];
  } catch {
    return null;
  }
}
