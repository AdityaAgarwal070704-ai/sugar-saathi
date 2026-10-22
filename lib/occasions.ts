// Curated food ideas for fasting days and festivals. Ids must exist in data/foods.json (checked by a test).
export const SEHRI_IDS = ["oats_porridge", "daliya", "curd", "egg", "paneer_cubes", "milk", "almonds", "moong_cheela", "besan_chilla"];
export const IFTAR_IDS = ["khajoor", "coconut_water", "fruit_chaat", "chaas", "dahi_vada", "pakora", "samosa", "sprouts_salad", "roasted_chana"];
export const SWEET_BUDGET_DEFAULT = 30;

// How many pieces of a food fit inside a carb budget (whole pieces only).
export function piecesWithin(carbsPerPiece: number, budget: number): number {
  if (!(carbsPerPiece > 0) || !(budget > 0)) return 0;
  return Math.floor(budget / carbsPerPiece);
}
