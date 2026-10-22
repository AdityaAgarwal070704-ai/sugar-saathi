import type { WeekStats } from "./stats";
import type { Profile } from "./types";

// A plain-text weekly summary for sharing (for example on WhatsApp) with family or your educator.
export function reportText(opts: { name: string | null; stats: WeekStats; observations: string[]; profile: Pick<Profile, "meal_carb_target">; from: Date; to: Date }): string {
  const { name, stats, observations, profile, from, to } = opts;
  const d = (x: Date) => x.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const lines = [
    `Sugar Saathi weekly report${name ? ` for ${name}` : ""}`,
    `${d(from)} to ${d(to)}`,
    "",
    `Meals logged: ${stats.meals} over ${stats.days} days`,
    `Average carbs per meal: ${stats.avgMealCarbs} g (goal ${profile.meal_carb_target} g)`,
    `Average rise after meals: ${stats.avgRise !== null ? `${stats.avgRise > 0 ? "+" : ""}${stats.avgRise} mg/dL (${stats.pairedMeals} paired meals)` : "not enough paired readings"}`,
    `Readings in range: ${stats.inRangePct !== null ? `${stats.inRangePct}%` : "no readings"}`,
    "",
    "Possible links to discuss:",
    ...observations.slice(0, 5).map((o) => `- ${o}`),
    "",
    "Estimates from a starter food table, not medical advice.",
  ];
  return lines.join("\n");
}

// Uses the phone's share sheet when available, otherwise opens WhatsApp with the text ready to send.
export async function shareText(text: string): Promise<"shared" | "opened" | "copied" | "failed"> {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      await navigator.share({ text });
      return "shared";
    }
  } catch (e) {
    if ((e as { name?: string }).name === "AbortError") return "failed"; // the user closed the sheet
  }
  try {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    return "opened";
  } catch {
    try {
      await navigator.clipboard.writeText(text);
      return "copied";
    } catch {
      return "failed";
    }
  }
}
