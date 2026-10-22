import type { Food, Category } from "./types";

// Home-cooked dishes: add up the raw ingredients, divide by servings. Plain maths, no AI.
export type Unit = "g" | "tsp" | "tbsp" | "cup" | "piece";
export const UNITS: Unit[] = ["g", "tsp", "tbsp", "cup", "piece"];

export type Ingredient = {
  id: string;
  name: string;
  carbs: number; // per 100 g raw
  fibre: number;
  protein: number;
  fat: number;
  gi: number;
  icon: string;
  units: Partial<Record<Exclude<Unit, "g">, number>>; // grams per unit
};

export type RecipeLine = { ingredientId: string; amount: number; unit: Unit };
export type Recipe = { id: string; name: string; servings: number; lines: RecipeLine[]; foodId: string; category: Category; icon: string };

export const MAX_SERVINGS = 50;
export const MAX_GRAMS = 5000;

// Which units can be used for an ingredient (grams is always allowed).
export function unitsFor(ing: Ingredient): Unit[] {
  return ["g", ...(Object.keys(ing.units) as Exclude<Unit, "g">[])];
}

export function lineGrams(line: RecipeLine, ing: Ingredient): number | null {
  if (!Number.isFinite(line.amount) || line.amount <= 0) return null;
  if (line.unit === "g") return line.amount;
  const per = ing.units[line.unit];
  return per ? line.amount * per : null;
}

export type RecipeResult =
  | { ok: true; perServing: { carbs: number; fibre: number; protein: number; fat: number; gi: number; kcal: number }; totalGrams: number }
  | { ok: false; error: string };

const r1 = (n: number) => Math.round(n * 10) / 10;

export function recipeNutrition(lines: RecipeLine[], servings: number, ingredients: Ingredient[]): RecipeResult {
  if (!Number.isInteger(servings) || servings < 1 || servings > MAX_SERVINGS) return { ok: false, error: `Servings must be a whole number from 1 to ${MAX_SERVINGS}.` };
  if (lines.length === 0) return { ok: false, error: "Add at least one ingredient." };
  const by = new Map(ingredients.map((i) => [i.id, i]));
  let carbs = 0, fibre = 0, protein = 0, fat = 0, giWeighted = 0, total = 0;
  for (const line of lines) {
    const ing = by.get(line.ingredientId);
    if (!ing) return { ok: false, error: "One of the ingredients isn't in the list. Remove it and pick another." };
    const g = lineGrams(line, ing);
    if (g === null) return { ok: false, error: `Enter an amount for ${ing.name}.` };
    if (g > MAX_GRAMS) return { ok: false, error: `${ing.name} looks too large (over ${MAX_GRAMS} g). Check the amount.` };
    const f = g / 100;
    const c = ing.carbs * f;
    carbs += c;
    fibre += ing.fibre * f;
    protein += ing.protein * f;
    fat += ing.fat * f;
    giWeighted += ing.gi * c;
    total += g;
  }
  const n = servings;
  const perCarbs = carbs / n;
  const perProtein = protein / n;
  const perFat = fat / n;
  return {
    ok: true,
    totalGrams: Math.round(total),
    perServing: {
      carbs: r1(perCarbs),
      fibre: r1(fibre / n),
      protein: r1(perProtein),
      fat: r1(perFat),
      gi: carbs > 0 ? Math.round(giWeighted / carbs) : 0, // carb-weighted glycemic index of the dish
      kcal: Math.round(4 * perCarbs + 4 * perProtein + 9 * perFat),
    },
  };
}

// The dish a recipe becomes in the food table ("one serving of my dish").
export function recipeToFood(recipe: Pick<Recipe, "foodId" | "name" | "category" | "icon">, per: { carbs: number; fibre: number; protein: number; fat: number; gi: number }): Food {
  return { id: recipe.foodId, name: recipe.name, unit: "serving", carbs: per.carbs, fibre: per.fibre, protein: per.protein, fat: per.fat, gi: per.gi, category: recipe.category, icon: recipe.icon, tags: ["mine"] };
}
