import { tEn, type T } from "./i18n";
import type { Profile } from "./types";

// A calm safety card for readings outside the user's own range. It never gives treatment or dosing instructions.
export type RangeAlert = { level: "low" | "high"; title: string; body: string };

export function rangeAlert(value: number, profile: Pick<Profile, "glucose_low" | "glucose_high">, t: T = tEn): RangeAlert | null {
  if (value < profile.glucose_low) return { level: "low", title: t("safe.low", { n: value }), body: t("safe.lowBody") };
  if (value > profile.glucose_high) return { level: "high", title: t("safe.high", { n: value }), body: t("safe.highBody") };
  return null;
}
