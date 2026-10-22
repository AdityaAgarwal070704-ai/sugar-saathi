import type { Profile } from "./types";

// A calm safety card for readings outside the user's own range. It never gives treatment or dosing instructions.
export type RangeAlert = { level: "low" | "high"; title: string; body: string };

const CARE = "If you feel unwell, contact your doctor or emergency services.";

export function rangeAlert(value: number, profile: Pick<Profile, "glucose_low" | "glucose_high">): RangeAlert | null {
  if (value < profile.glucose_low) {
    return { level: "low", title: `${value} mg/dL is below your range`, body: `Follow the plan your doctor gave you for low readings. ${CARE}` };
  }
  if (value > profile.glucose_high) {
    return { level: "high", title: `${value} mg/dL is above your range`, body: `Follow the plan your doctor gave you for high readings. A single reading is one data point, so note what you ate and did. ${CARE}` };
  }
  return null;
}
