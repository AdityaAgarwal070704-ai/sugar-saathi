import type { WeekStats } from "./stats";
import type { Profile } from "./types";

export type Checkin = { highlights: string[]; tryThis: string };

// The weekly check-in: a calm look back and one small thing to try. No scores, no shaming.
export function weeklyCheckin(stats: WeekStats, profile: Pick<Profile, "meal_carb_target">): Checkin {
  const highlights: string[] = [];
  highlights.push(`You logged ${stats.meals} meal${stats.meals === 1 ? "" : "s"} on ${stats.days} day${stats.days === 1 ? "" : "s"}.`);
  highlights.push(`Average carbs per meal: ${stats.avgMealCarbs} g (your goal is ${profile.meal_carb_target} g).`);
  if (stats.inRangePct !== null) highlights.push(`${stats.inRangePct}% of your readings were in range.`);
  if (stats.avgRise !== null) highlights.push(`Your average rise after meals was ${stats.avgRise > 0 ? "+" : ""}${stats.avgRise} mg/dL across ${stats.pairedMeals} paired meals.`);

  let tryThis = "Pick one meal this week and add a short walk after it. Notice how you feel and what your readings show.";
  if (stats.meals >= 4) {
    if (stats.avgFibre < 5) tryThis = "Add a salad or an extra sabzi to your lunch and dinner this week. Fibre is the easiest thing to raise.";
    else if (stats.avgProtein < 12) tryThis = "Add a protein to one meal a day this week: curd, paneer, an egg, dal or sprouts.";
    else if (stats.mealsOverTarget / stats.meals >= 0.4) tryThis = "Try a slightly smaller portion of rice or roti at your biggest meal this week.";
  }
  return { highlights, tryThis };
}
