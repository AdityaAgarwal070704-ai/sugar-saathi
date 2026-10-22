import type { Profile } from "./types";
import type { WeekStats } from "./stats";

// "Saathi says": one friendly, rule-based line per day. Static, reviewed wording; food and routine guidance only.
const GENERAL = [
  "A short walk after a meal is a habit many people find helpful. Ask your doctor what suits you.",
  "Pairing roti or rice with dal and a sabzi usually makes a more balanced plate than grains alone.",
  "Water is a good default drink. Notice how many sweet drinks sneak into your day.",
  "Fibre slows things down: salad, sabzi, dal and whole grains all help.",
  "Eating at regular times can make your readings easier to understand.",
  "Logging takes seconds. Even a rough entry is more useful than a perfect one you skip.",
  "Curd, paneer, eggs, dal or sprouts add protein that keeps you full.",
  "Festival or eating out? Plan one favourite and enjoy a small portion of it.",
  "Note unusual days (illness, stress, travel) so you can explain surprising readings to your educator.",
  "Before your next appointment, open the Report page and bring it along.",
];

export function saathiSays(opts: { stats: WeekStats; todayMeals: number; profile: Pick<Profile, "meal_carb_target">; dayOfYear: number }): string {
  const { stats, todayMeals, dayOfYear } = opts;
  if (stats.meals === 0) return "Welcome! Log your first meal and I'll show you carbs, protein, fibre and how it looks for your sugar.";
  if (todayMeals === 0) return "Good start to a new day. Log your first meal when you eat, it only takes a few seconds.";
  if (stats.meals >= 4 && stats.avgFibre < 4) return "Your meals have been a bit low in fibre lately. Adding a salad, sabzi or dal is an easy fix.";
  if (stats.meals >= 4 && stats.avgProtein < 10) return "Protein has been on the low side. Curd, paneer, eggs, dal or sprouts can help fill the gap.";
  if (stats.meals >= 4 && stats.mealsOverTarget / stats.meals >= 0.5) return "Many meals ran above your carb goal this week. Try a slightly smaller portion of rice or roti and see how it feels.";
  return GENERAL[dayOfYear % GENERAL.length];
}
