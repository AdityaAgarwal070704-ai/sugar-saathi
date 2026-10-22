import type { MealRow, ReadingRow } from "./types";

export type DayTotals = { date: string; label: string; carbs: number; protein: number; fibre: number; fat: number; kcal: number; meals: number };

const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// One entry per day for the last `days` days (oldest first), including days with nothing logged.
export function dailySeries(
  meals: (Pick<MealRow, "eaten_at" | "carbs" | "fibre" | "protein"> & { fat?: number; kcal?: number })[],
  days: number,
  now: Date,
): DayTotals[] {
  const out: DayTotals[] = [];
  const byDay = new Map<string, DayTotals>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const t: DayTotals = { date: key(d), label: d.toLocaleDateString("en-IN", { weekday: "short" }), carbs: 0, protein: 0, fibre: 0, fat: 0, kcal: 0, meals: 0 };
    out.push(t);
    byDay.set(t.date, t);
  }
  for (const m of meals) {
    const t = byDay.get(key(new Date(m.eaten_at)));
    if (!t) continue;
    t.carbs += m.carbs;
    t.protein += m.protein;
    t.fibre += m.fibre;
    t.fat += m.fat ?? 0;
    t.kcal += m.kcal ?? 0;
    t.meals++;
  }
  for (const t of out) {
    t.protein = Math.round(t.protein * 10) / 10;
    t.fibre = Math.round(t.fibre * 10) / 10;
    t.fat = Math.round(t.fat * 10) / 10;
  }
  return out;
}

export function averageGlucose(readings: Pick<ReadingRow, "value">[]): number | null {
  if (readings.length === 0) return null;
  return Math.round(readings.reduce((a, r) => a + r.value, 0) / readings.length);
}

export function timeInRange(readings: Pick<ReadingRow, "value">[], low: number, high: number): number | null {
  if (readings.length === 0) return null;
  return Math.round((readings.filter((r) => r.value >= low && r.value <= high).length / readings.length) * 100);
}

// Glucose Management Indicator (Bergenstal et al. 2018): 3.31 + 0.02392 x mean glucose (mg/dL).
// Only meaningful with continuous (CGM) data over about two weeks, so we return null otherwise.
// It is NOT a lab HbA1c and is shown with that caveat.
export const GMI_MIN_DAYS = 14;
export const GMI_MIN_READINGS = 200;

export function gmi(readings: Pick<ReadingRow, "value" | "measured_at" | "source">[]): { value: number; days: number; readings: number } | null {
  const csv = readings.filter((r) => r.source === "csv");
  if (csv.length < GMI_MIN_READINGS) return null;
  const times = csv.map((r) => new Date(r.measured_at).getTime());
  const days = (Math.max(...times) - Math.min(...times)) / 86400_000;
  if (days < GMI_MIN_DAYS) return null;
  const mean = csv.reduce((a, r) => a + r.value, 0) / csv.length;
  return { value: Math.round((3.31 + 0.02392 * mean) * 10) / 10, days: Math.round(days), readings: csv.length };
}

// Readings from 30 minutes before to 3 hours after a meal, for the glucose curve.
export function readingsAround(readings: ReadingRow[], mealTimeIso: string, beforeMin = 30, afterMin = 180): ReadingRow[] {
  const t = new Date(mealTimeIso).getTime();
  return readings
    .filter((r) => {
      const x = new Date(r.measured_at).getTime();
      return x >= t - beforeMin * 60_000 && x <= t + afterMin * 60_000;
    })
    .sort((a, b) => a.measured_at.localeCompare(b.measured_at));
}
