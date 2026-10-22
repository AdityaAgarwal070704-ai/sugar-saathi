import type { Category, Food, SavedItem } from "./types";

// Glycemic impact: a general, food-table-based label. It is NOT a prediction of anyone's glucose.
// Thresholds are starter values (not clinically validated).
export type ImpactLevel = "low" | "medium" | "high";

export const IMPACT_LOW_MAX = 15;
export const IMPACT_MEDIUM_MAX = 29;

export function glycemicImpact(gl: number): ImpactLevel {
  if (gl <= IMPACT_LOW_MAX) return "low";
  if (gl <= IMPACT_MEDIUM_MAX) return "medium";
  return "high";
}

export const IMPACT_TEXT: Record<ImpactLevel, string> = {
  low: "Gentle on most people's sugar",
  medium: "A moderate effect on sugar",
  high: "Likely to raise sugar more",
};

export type PlateGroups = {
  veg: boolean; // vegetables and salad
  dal: boolean; // dal and legumes
  protein: boolean; // paneer, egg, meat, fish, curd, nuts
  grain: boolean; // roti, rice and other grains
  grainShare: number; // share of this meal's carbs that come from grains (0 to 1)
};

const PROTEIN_CATS: Category[] = ["protein", "dairy", "nuts"];

// Which food groups are on the plate, in plain terms. No portion-weight guessing.
export function plateGroups(items: Pick<SavedItem, "foodId" | "count">[], foods: Food[]): PlateGroups {
  const byId = new Map(foods.map((f) => [f.id, f]));
  let total = 0;
  let grain = 0;
  const has = { veg: false, dal: false, protein: false, grain: false };
  for (const it of items) {
    const f = byId.get(it.foodId);
    if (!f) continue;
    const carbs = f.carbs * it.count;
    total += carbs;
    if (f.category === "veg") has.veg = true;
    if (f.category === "dal") has.dal = true;
    if (PROTEIN_CATS.includes(f.category)) has.protein = true;
    if (f.category === "grain") {
      has.grain = true;
      grain += carbs;
    }
  }
  return { ...has, grainShare: total > 0 ? grain / total : 0 };
}
