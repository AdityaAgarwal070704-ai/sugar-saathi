import { EN, type Loc } from "./insights";
import type { WeekStats } from "./stats";
import type { Profile } from "./types";
import type { MessageKey } from "./i18n";

// "Saathi says": one friendly, rule-based line per day. Static, reviewed wording; food and routine guidance only.
const GENERAL = Array.from({ length: 10 }, (_, i) => `say.g${i}` as MessageKey);

export function saathiSays(opts: { stats: WeekStats; todayMeals: number; profile: Pick<Profile, "meal_carb_target">; dayOfYear: number }, loc: Loc = EN): string {
  const { t } = loc;
  const { stats, todayMeals, dayOfYear } = opts;
  if (stats.meals === 0) return t("say.welcome");
  if (todayMeals === 0) return t("say.newday");
  if (stats.meals >= 4 && stats.avgFibre < 4) return t("say.fibre");
  if (stats.meals >= 4 && stats.avgProtein < 10) return t("say.protein");
  if (stats.meals >= 4 && stats.mealsOverTarget / stats.meals >= 0.5) return t("say.over");
  return t(GENERAL[dayOfYear % GENERAL.length]);
}
