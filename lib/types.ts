export type Category = "grain" | "dal" | "veg" | "protein" | "dairy" | "fruit" | "sweet" | "snack" | "drink" | "nuts" | "extra";

export type Food = {
  id: string;
  name: string;
  hi?: string; // Hindi name
  unit: string;
  carbs: number; // grams per one unit
  fibre: number; // grams per one unit
  protein: number; // grams per one unit
  fat: number; // grams per one unit
  gi: number; // glycemic index, 0 to 100
  category: Category;
  icon: string; // emoji
  tags: string[]; // for example "vrat", "festival", "restaurant"
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

// Goals saved in the browser (no accounts).
export type Profile = {
  display_name: string | null;
  meal_carb_target: number; // grams per meal
  glucose_low: number; // mg/dL
  glucose_high: number; // mg/dL
  diet: "veg" | "nonveg" | "egg";
  language: "en" | "hi";
};

// ----- Habit layer (all stored in the browser)
export type RoutineItem = { id: string; label: string; icon: string };
export type Walk = { id: string; started_at: string; minutes: number };
export type WalkTimer = { started_at: string; minutes: number };
export type Reminders = {
  breakfast: string; // "HH:MM"
  lunch: string;
  snack: string | null;
  dinner: string;
  checks: boolean; // a 2-hour sugar check after each meal
  walks: boolean; // a walk reminder after each meal
};
