import type { MealRow, MealType, Profile, ReadingRow, SavedItem } from "./types";

// Pure functions for the browser-storage layer (no browser APIs), so they can be tested.

export type State = { meals: MealRow[]; readings: ReadingRow[]; profile: Profile };

export const DEFAULT_PROFILE: Profile = { display_name: null, meal_carb_target: 60, glucose_low: 70, glucose_high: 180, diet: "veg" };
export const EMPTY_STATE: State = { meals: [], readings: [], profile: DEFAULT_PROFILE };

// Readings are stored compactly as [epoch ms, mg/dL, source] so a year of CGM data fits in browser storage.
export type PersistedReading = [number, number, 0 | 1];
export type Persisted = { v: 1; meals: MealRow[]; readings: PersistedReading[]; profile: Profile };

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export function readingKey(ms: number, value: number) {
  return `${ms}-${value}`;
}

export function toReadingRow([ms, value, src]: PersistedReading): ReadingRow {
  return { id: readingKey(ms, value), measured_at: new Date(ms).toISOString(), value, source: src === 1 ? "csv" : "manual" };
}

export function toPersisted(state: State): Persisted {
  return {
    v: 1,
    meals: state.meals,
    readings: state.readings.map((r) => [new Date(r.measured_at).getTime(), r.value, r.source === "csv" ? 1 : 0] as PersistedReading),
    profile: state.profile,
  };
}

function validItems(items: unknown): items is SavedItem[] {
  return Array.isArray(items) && items.every((i) => i && typeof i.foodId === "string" && typeof i.count === "number" && typeof i.typed === "string");
}

function validProfile(p: unknown): Profile {
  const x = (p ?? {}) as Partial<Profile>;
  const num = (n: unknown, lo: number, hi: number, d: number) => (typeof n === "number" && Number.isFinite(n) && n >= lo && n <= hi ? Math.round(n) : d);
  const low = num(x.glucose_low, 40, 120, DEFAULT_PROFILE.glucose_low);
  const high = num(x.glucose_high, 100, 300, DEFAULT_PROFILE.glucose_high);
  return {
    display_name: typeof x.display_name === "string" && x.display_name.trim() ? x.display_name.trim().slice(0, 40) : null,
    meal_carb_target: num(x.meal_carb_target, 10, 200, DEFAULT_PROFILE.meal_carb_target),
    glucose_low: low,
    glucose_high: high > low ? high : DEFAULT_PROFILE.glucose_high,
    diet: x.diet === "nonveg" || x.diet === "egg" ? x.diet : "veg",
  };
}

// Reads stored or backed-up data defensively: anything malformed is dropped, never trusted.
export function fromPersisted(raw: unknown): State | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Partial<Persisted>;
  if (d.v !== 1 || !Array.isArray(d.meals) || !Array.isArray(d.readings)) return null;

  const meals: MealRow[] = [];
  for (const m of d.meals) {
    if (
      m && typeof m.id === "string" && typeof m.eaten_at === "string" && !Number.isNaN(new Date(m.eaten_at).getTime()) &&
      MEAL_TYPES.includes(m.meal_type) && typeof m.text === "string" && validItems(m.items) &&
      [m.carbs, m.fibre, m.protein, m.gl].every((n) => typeof n === "number" && Number.isFinite(n))
    ) {
      meals.push({ id: m.id, eaten_at: m.eaten_at, meal_type: m.meal_type, text: m.text.slice(0, 300), items: m.items, carbs: m.carbs, fibre: m.fibre, protein: m.protein, gl: m.gl });
    }
  }
  const readings: ReadingRow[] = [];
  for (const r of d.readings) {
    if (Array.isArray(r) && Number.isFinite(r[0]) && Number.isFinite(r[1]) && r[1] >= 40 && r[1] <= 600) {
      readings.push(toReadingRow([r[0], Math.round(r[1]), r[2] === 1 ? 1 : 0]));
    }
  }
  return { meals, readings, profile: validProfile(d.profile) };
}

// Adds readings, ignoring exact duplicates (same minute-precise time and value). Returns the new list and how many were added.
export function mergeReadings(existing: ReadingRow[], incoming: { measured_at: string; value: number; source: "manual" | "csv" }[]) {
  const seen = new Set(existing.map((r) => r.id));
  const next = [...existing];
  let added = 0;
  for (const r of incoming) {
    const ms = new Date(r.measured_at).getTime();
    if (!Number.isFinite(ms) || r.value < 40 || r.value > 600) continue;
    const id = readingKey(ms, Math.round(r.value));
    if (seen.has(id)) continue;
    seen.add(id);
    next.push({ id, measured_at: new Date(ms).toISOString(), value: Math.round(r.value), source: r.source });
    added++;
  }
  next.sort((a, b) => b.measured_at.localeCompare(a.measured_at));
  return { readings: next, added };
}
