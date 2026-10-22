import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Ingredient } from "./recipe";

// Server-only: loads the ingredient table. Returns null if it is missing or malformed.
export async function loadIngredients(): Promise<Ingredient[] | null> {
  try {
    const raw = await readFile(path.join(process.cwd(), "data", "ingredients.json"), "utf8");
    const list = JSON.parse(raw).ingredients;
    if (!Array.isArray(list) || list.length === 0) return null;
    for (const i of list) {
      if (typeof i.id !== "string" || typeof i.name !== "string" || !i.units || ![i.carbs, i.fibre, i.protein, i.fat, i.gi].every((n) => typeof n === "number")) return null;
    }
    return list as Ingredient[];
  } catch {
    return null;
  }
}
