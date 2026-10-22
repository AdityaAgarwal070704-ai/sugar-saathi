import { EN, type Loc } from "./insights";
import type { WeekStats } from "./stats";
import type { Profile } from "./types";

export type Checkin = { highlights: string[]; tryThis: string };

// The weekly check-in: a calm look back and one small thing to try. No scores, no shaming.
export function weeklyCheckin(stats: WeekStats, profile: Pick<Profile, "meal_carb_target">, loc: Loc = EN): Checkin {
  const { t } = loc;
  const highlights: string[] = [];
  highlights.push(t("ci.logged", { m: stats.meals, d: stats.days, n: stats.meals === 1 && stats.days === 1 ? 1 : 2 }));
  highlights.push(t("ci.avg", { a: stats.avgMealCarbs, g: profile.meal_carb_target }));
  if (stats.inRangePct !== null) highlights.push(t("ci.range", { n: stats.inRangePct }));
  if (stats.avgRise !== null) highlights.push(t("ci.rise", { r: `${stats.avgRise > 0 ? "+" : ""}${stats.avgRise}`, p: stats.pairedMeals }));

  let tryThis = t("ci.try.walk");
  if (stats.meals >= 4) {
    if (stats.avgFibre < 5) tryThis = t("ci.try.fibre");
    else if (stats.avgProtein < 12) tryThis = t("ci.try.protein");
    else if (stats.mealsOverTarget / stats.meals >= 0.4) tryThis = t("ci.try.portion");
  }
  return { highlights, tryThis };
}
