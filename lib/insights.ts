import type { Food, Profile, SavedItem } from "./types";
import { nutritionOf } from "./carbs";

// Rule-based, deterministic meal feedback. Plain code, no AI.
// Every line is a suggestion to discuss with an educator or doctor, never a medical instruction.
// Thresholds are starter guidance, not clinically validated.

export type Rating = "lower" | "moderate" | "higher";
export type Swap = { from: string; to: string; saves: number; note: string };
export type MealTips = {
  rating: Rating;
  headline: string;
  good: string[];
  improve: string[];
  swaps: Swap[];
};

const SWAPS: Record<string, { to: string; note: string }> = {
  white_rice: { to: "brown_rice", note: "brown rice has more fibre and a lower glycemic index" },
  jeera_rice: { to: "brown_rice", note: "brown rice has more fibre and a lower glycemic index" },
  naan: { to: "roti", note: "roti is a smaller, higher-fibre carb portion than naan" },
  bhatura: { to: "roti", note: "roti is lighter and has more fibre" },
  puri: { to: "roti", note: "roti avoids the deep-fried portion" },
  plain_paratha: { to: "roti", note: "roti uses less oil for the same carb base" },
  bread_slice: { to: "roti", note: "whole-wheat roti has more fibre" },
  pav: { to: "roti", note: "whole-wheat roti has more fibre" },
  plain_dosa: { to: "besan_chilla", note: "besan chilla has more protein and a lower glycemic index" },
  masala_dosa: { to: "besan_chilla", note: "besan chilla has more protein and a lower glycemic index" },
  poha: { to: "khichdi", note: "dal khichdi adds protein and fibre" },
  aloo_sabzi: { to: "gobi_sabzi", note: "a non-starchy vegetable sabzi has fewer carbs" },
  dal_makhani: { to: "dal", note: "plain dal has fewer carbs and less cream and butter" },
  mango: { to: "apple", note: "apple has a lower glycemic index" },
  banana: { to: "apple", note: "apple has a lower glycemic index" },
  samosa: { to: "dhokla", note: "steamed dhokla avoids the deep-fried pastry" },
  kulcha: { to: "roti", note: "roti is a lighter, higher-fibre choice" },
  lachha_paratha: { to: "roti", note: "roti uses far less oil" },
  cola: { to: "coconut_water", note: "coconut water has far less sugar than a soft drink" },
  fruit_juice_packaged: { to: "orange", note: "the whole fruit keeps its fibre" },
  lassi_sweet: { to: "lassi_salted", note: "salted lassi has far less sugar" },
  sugarcane_juice: { to: "nimbu_pani_sugar", note: "nimbu pani has fewer carbs than sugarcane juice" },
  chai_sugar: { to: "chai_nosugar", note: "skipping sugar in tea saves carbs every cup" },
  coffee_sugar: { to: "black_coffee", note: "skipping sugar and milk saves carbs" },
  biscuits: { to: "roasted_chana", note: "roasted chana adds protein and fibre" },
  marie_biscuit: { to: "roasted_chana", note: "roasted chana adds protein and fibre" },
  chips_packet: { to: "roasted_chana", note: "roasted chana is crunchy with more protein and fibre" },
  maggi: { to: "poha", note: "poha with vegetables is more filling for similar carbs" },
  pizza_slice: { to: "roti", note: "a roti-based plate has more fibre" },
  french_fries: { to: "boiled_sweet_potato", note: "boiled sweet potato avoids the frying" },
  fried_rice: { to: "pulao", note: "veg pulao is lighter on oil" },
  jeera_aloo: { to: "bhindi_sabzi", note: "a non-starchy vegetable has fewer carbs" },
};

export function mealTips(items: Pick<SavedItem, "foodId" | "count">[], foods: Food[], profile: Pick<Profile, "meal_carb_target">): MealTips {
  const byId = new Map(foods.map((f) => [f.id, f]));
  const lines = items.map((i) => ({ ...i, food: byId.get(i.foodId) })).filter((l) => l.food);
  const n = nutritionOf(items, foods);
  const target = profile.meal_carb_target;
  const good: string[] = [];
  const improve: string[] = [];
  const swaps: Swap[] = [];

  const has = (cat: Food["category"]) => lines.some((l) => l.food!.category === cat);
  const carbOf = (l: (typeof lines)[number]) => l.food!.carbs * l.count;

  // Rating
  let rating: Rating = "moderate";
  if (n.carbs > target * 1.2 || n.gl >= 35) rating = "higher";
  else if (n.carbs <= target * 0.8 && n.gl <= 20) rating = "lower";
  const headline =
    rating === "higher"
      ? `A higher-carb meal: about ${n.carbs} g carbs (glycemic load about ${n.gl}).`
      : rating === "lower"
        ? `A lighter-carb meal: about ${n.carbs} g carbs (glycemic load about ${n.gl}).`
        : `A moderate meal: about ${n.carbs} g carbs (glycemic load about ${n.gl}).`;

  // What's good
  if (has("dal")) good.push("Dal or legumes bring fibre and protein, which slow down how fast carbs are absorbed.");
  if (has("veg")) good.push("There is a vegetable in this meal, which adds fibre.");
  if (n.protein >= 15) good.push(`Good protein for one meal (about ${n.protein} g).`);
  if (n.fibre >= 6) good.push(`Good fibre (about ${n.fibre} g).`);
  if (lines.some((l) => l.food!.gi <= 40 && l.food!.carbs * l.count >= 5)) {
    good.push("It includes a low glycemic index food, which tends to raise glucose more gently.");
  }
  if (rating === "lower") good.push("Carbs are comfortably within your per-meal goal.");

  // What could be better
  if (n.carbs > target) {
    const biggest = [...lines].sort((a, b) => carbOf(b) - carbOf(a))[0];
    if (biggest) {
      const half = Math.round(carbOf(biggest) / 2);
      improve.push(
        `About ${n.carbs} g carbs is above your ${target} g per-meal goal. A smaller portion of ${biggest.food!.name} (say half) would save about ${half} g.`,
      );
    }
  }
  const refined = lines.filter((l) => ["grain"].includes(l.food!.category) && l.food!.fibre / Math.max(l.food!.carbs, 1) < 0.1);
  const refinedCarbs = refined.reduce((a, l) => a + carbOf(l), 0);
  if (n.carbs > 0 && refinedCarbs / n.carbs >= 0.6) {
    improve.push("Most of the carbs here come from refined grains. Pairing them with dal, vegetables or curd can help balance the meal.");
  }
  if (!has("veg") && !has("dal") && has("grain")) improve.push("No vegetable or dal on the plate. Adding a sabzi, salad or dal adds fibre.");
  if (n.protein < 10) improve.push(`Low in protein (about ${n.protein} g). Curd, paneer, egg or dal alongside can help.`);
  else if (n.fibre < 4) improve.push(`Low in fibre (about ${n.fibre} g). Vegetables, salad or whole grains can add more.`);
  if (has("sweet")) improve.push("Sweets are best kept as a small, occasional portion. Worth discussing with your educator.");
  if (lines.some((l) => ["chai_sugar", "coffee_sugar", "cola", "fruit_juice_packaged", "sugarcane_juice", "lassi_sweet"].includes(l.food!.id))) improve.push("Sweet drinks add carbs quickly, with nothing to slow them down. Worth discussing how often with your educator.");

  // Swaps
  for (const l of lines) {
    const s = SWAPS[l.food!.id];
    const to = s && byId.get(s.to);
    if (!s || !to || lines.some((x) => x.food!.id === to.id)) continue;
    const saves = Math.round(l.food!.carbs * l.count - to.carbs * l.count);
    if (saves >= 3) swaps.push({ from: l.food!.name, to: to.name, saves, note: s.note });
  }
  swaps.sort((a, b) => b.saves - a.saves);

  return { rating, headline, good, improve, swaps: swaps.slice(0, 3) };
}

import type { WeekStats } from "./stats";

// Rule-based observations about the week. Always worded as "possible links to discuss", never as conclusions.
export function weeklyObservations(s: WeekStats, profile: Pick<Profile, "meal_carb_target" | "glucose_high">): string[] {
  const out: string[] = [];
  if (s.meals === 0) return ["Log a few meals this week and patterns will start to appear here."];

  if (s.mealsOverTarget > 0) {
    out.push(
      `${s.mealsOverTarget} of ${s.meals} meals were well above your ${profile.meal_carb_target} g per-meal carb goal. Worth looking at which dishes drive this.`,
    );
  } else {
    out.push(`All ${s.meals} logged meals stayed close to your ${profile.meal_carb_target} g per-meal carb goal. Nice consistency.`);
  }
  if (s.avgFibre < 5) out.push(`Fibre averages about ${s.avgFibre} g per meal, which is on the low side. Dal, vegetables and whole grains can raise it.`);
  if (s.avgProtein < 12) out.push(`Protein averages about ${s.avgProtein} g per meal. Curd, paneer, eggs, dal or sprouts can add more.`);

  const slots = Object.entries(s.byMealType).filter(([, v]) => v);
  const heaviest = [...slots].sort((a, b) => (b[1]!.avgCarbs ?? 0) - (a[1]!.avgCarbs ?? 0))[0];
  if (heaviest && slots.length > 1) out.push(`${heaviest[0][0].toUpperCase() + heaviest[0].slice(1)} is your carb-heaviest meal (about ${heaviest[1]!.avgCarbs} g on average).`);

  if (s.avgRise !== null) {
    out.push(`Across ${s.pairedMeals} meals with before and 2-hour readings, the average rise was ${s.avgRise} mg/dL.`);
    if (s.biggestRises[0]) {
      const b = s.biggestRises[0];
      out.push(`The biggest rise was +${b.rise} mg/dL after "${b.text}" (about ${b.carbs} g carbs). Possible link to discuss with your educator.`);
    }
  } else if (s.readings === 0) {
    out.push("Add glucose readings (quick entry or a CSV import) so each meal can be paired with its before and 2-hour values.");
  } else {
    out.push("Some readings are saved, but none fall in the before-meal and 2-hour windows around your meals yet.");
  }
  for (const d of s.dishRises.slice(0, 2)) {
    out.push(`Meals with ${d.name} (${d.meals} times) averaged a +${d.avgRise} mg/dL rise. Other foods, timing or activity may play a part too. Possible link to discuss.`);
  }
  if (s.inRangePct !== null) out.push(`${s.inRangePct}% of your ${s.readings} readings were inside your range goal.`);
  return out;
}
