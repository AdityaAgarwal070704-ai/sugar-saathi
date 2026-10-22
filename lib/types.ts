export type Food = {
  id: string;
  name: string;
  unit: string;
  carbs: number; // grams of carbohydrate per one unit
};

// One line of a meal. foodId is null when the dish isn't in our table.
export type Item = {
  key: string; // client-side id for React lists
  typed: string; // the words the user used, e.g. "dal"
  foodId: string | null;
  count: number;
  confidence: number; // 0 to 1, from Claude
};

export type ParseResponse = {
  items: Omit<Item, "key">[];
  foods: Food[];
};

export type Meal = {
  id: string;
  text: string;
  carbs: number;
  partial: boolean; // true if some items weren't in the table
  pre: number | null;
  post: number | null;
};
