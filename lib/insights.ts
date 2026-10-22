import { nutritionOf } from "./carbs";
import { foodName, tEn, type Lang, type MessageKey, type T } from "./i18n";
import type { Food, Profile, SavedItem } from "./types";

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

const SWAPS: Record<string, { to: string; note: MessageKey }> = {
  white_rice: { to: "brown_rice", note: "swap.brownrice" },
  jeera_rice: { to: "brown_rice", note: "swap.brownrice" },
  naan: { to: "roti", note: "swap.naan" },
  bhatura: { to: "roti", note: "swap.light" },
  puri: { to: "roti", note: "swap.fried" },
  plain_paratha: { to: "roti", note: "swap.oil" },
  bread_slice: { to: "roti", note: "swap.wheat" },
  pav: { to: "roti", note: "swap.wheat" },
  plain_dosa: { to: "besan_chilla", note: "swap.chilla" },
  masala_dosa: { to: "besan_chilla", note: "swap.chilla" },
  poha: { to: "khichdi", note: "swap.khichdi" },
  aloo_sabzi: { to: "gobi_sabzi", note: "swap.sabzi" },
  dal_makhani: { to: "dal", note: "swap.dal" },
  mango: { to: "apple", note: "swap.apple" },
  banana: { to: "apple", note: "swap.apple" },
  samosa: { to: "dhokla", note: "swap.dhokla" },
  kulcha: { to: "roti", note: "swap.light" },
  lachha_paratha: { to: "roti", note: "swap.oilfar" },
  cola: { to: "coconut_water", note: "swap.coconut" },
  fruit_juice_packaged: { to: "orange", note: "swap.fruit" },
  lassi_sweet: { to: "lassi_salted", note: "swap.lassi" },
  sugarcane_juice: { to: "nimbu_pani_sugar", note: "swap.nimbu" },
  chai_sugar: { to: "chai_nosugar", note: "swap.chai" },
  coffee_sugar: { to: "black_coffee", note: "swap.coffee" },
  marie_biscuit: { to: "roasted_chana", note: "swap.chana" },
  chips_packet: { to: "roasted_chana", note: "swap.chanaCrunch" },
  maggi: { to: "poha", note: "swap.poha" },
  pizza_slice: { to: "roti", note: "swap.roti" },
  french_fries: { to: "boiled_sweet_potato", note: "swap.sweetpotato" },
  fried_rice: { to: "pulao", note: "swap.pulao" },
  jeera_aloo: { to: "bhindi_sabzi", note: "swap.sabzi" },
};

export type Loc = { t: T; lang: Lang };
export const EN: Loc = { t: tEn, lang: "en" };

export function mealTips(items: Pick<SavedItem, "foodId" | "count">[], foods: Food[], profile: Pick<Profile, "meal_carb_target">, loc: Loc = EN): MealTips {
  const { t, lang } = loc;
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
  const headline = t(`tips.head.${rating}` as MessageKey, { c: n.carbs, gl: n.gl });

  // What's good
  if (has("dal")) good.push(t("tips.good.dal"));
  if (has("veg")) good.push(t("tips.good.veg"));
  if (n.protein >= 15) good.push(t("tips.good.protein", { n: n.protein }));
  if (n.fibre >= 6) good.push(t("tips.good.fibre", { n: n.fibre }));
  if (lines.some((l) => l.food!.gi <= 40 && l.food!.carbs * l.count >= 5)) good.push(t("tips.good.lowgi"));
  if (rating === "lower") good.push(t("tips.good.within"));

  // What could be better
  if (n.carbs > target) {
    const biggest = [...lines].sort((a, b) => carbOf(b) - carbOf(a))[0];
    if (biggest) improve.push(t("tips.imp.over", { c: n.carbs, t: target, dish: foodName(biggest.food!, lang), s: Math.round(carbOf(biggest) / 2) }));
  }
  const refined = lines.filter((l) => ["grain"].includes(l.food!.category) && l.food!.fibre / Math.max(l.food!.carbs, 1) < 0.1);
  const refinedCarbs = refined.reduce((a, l) => a + carbOf(l), 0);
  if (n.carbs > 0 && refinedCarbs / n.carbs >= 0.6) improve.push(t("tips.imp.refined"));
  if (!has("veg") && !has("dal") && has("grain")) improve.push(t("tips.imp.noveg"));
  if (n.protein < 10) improve.push(t("tips.imp.lowprotein", { n: n.protein }));
  else if (n.fibre < 4) improve.push(t("tips.imp.lowfibre", { n: n.fibre }));
  if (has("sweet")) improve.push(t("tips.imp.sweets"));
  if (lines.some((l) => ["chai_sugar", "coffee_sugar", "cola", "fruit_juice_packaged", "sugarcane_juice", "lassi_sweet"].includes(l.food!.id))) improve.push(t("tips.imp.drinks"));

  // Swaps
  for (const l of lines) {
    const sw = SWAPS[l.food!.id];
    const to = sw && byId.get(sw.to);
    if (!sw || !to || lines.some((x) => x.food!.id === to.id)) continue;
    const saves = Math.round(l.food!.carbs * l.count - to.carbs * l.count);
    if (saves >= 3) swaps.push({ from: foodName(l.food!, lang), to: foodName(to, lang), saves, note: t(sw.note) });
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
