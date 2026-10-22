export type Category = "grain" | "dal" | "veg" | "protein" | "dairy" | "fruit" | "sweet" | "snack" | "drink";

export type Food = {
  id: string;
  name: string;
  unit: string;
  carbs: number; // grams per one unit
  fibre: number; // grams per one unit
  protein: number; // grams per one unit
  gi: number; // glycemic index, 0 to 100
  category: Category;
};

// One line of a meal. foodId is null when the dish isn't in our table.
export type Item = {
  key: string; // client-side id for React lists
  typed: string; // the words the user used, e.g. "dal"
  foodId: string | null;
  count: number;
  confidence: number; // 0 to 1, from the AI
};

export type ParseResponse = {
  items: Omit<Item, "key">[];
  foods: Food[];
  usage?: { used: number; limit: number | null };
};

// A saved line of a meal (what we store in the database).
export type SavedItem = { foodId: string; count: number; typed: string };

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type MealRow = {
  id: string;
  eaten_at: string; // ISO timestamp
  meal_type: MealType;
  text: string;
  items: SavedItem[];
  carbs: number;
  fibre: number;
  protein: number;
  gl: number;
};

export type ReadingRow = {
  id: string;
  measured_at: string; // ISO timestamp
  value: number; // mg/dL
  source: "manual" | "csv";
};

export type Profile = {
  id: string;
  plan: "free" | "pro";
  display_name: string | null;
  meal_carb_target: number; // grams per meal
  glucose_low: number; // mg/dL
  glucose_high: number; // mg/dL
  diet: "veg" | "nonveg" | "egg";
};
