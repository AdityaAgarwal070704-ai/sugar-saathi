import type { MealRow, MealType, Profile, Reminders, ReadingRow, RoutineItem, SavedItem, Walk, WalkTimer } from "./types";

// Pure functions for the browser-storage layer (no browser APIs), so they can be tested.

export type Extras = {
  routine: RoutineItem[];
  ticks: Record<string, string[]>; // "YYYY-MM-DD" -> ids of routine items done that day
  walks: Walk[];
  timer: WalkTimer | null;
  reminders: Reminders;
  checkinAt: string | null; // when the weekly check-in was last done
  wrapupDismissed: string | null; // "YYYY-MM-DD" of the day whose wrap-up was dismissed
};

export type State = { meals: MealRow[]; readings: ReadingRow[]; profile: Profile } & Extras;

export const DEFAULT_REMINDERS: Reminders = { breakfast: "08:30", lunch: "13:30", snack: null, dinner: "20:00", checks: true, walks: true };
export const DEFAULT_ROUTINE: RoutineItem[] = [
  { id: "walk", label: "10-minute walk after a meal", icon: "🚶" },
  { id: "water", label: "Drink enough water", icon: "💧" },
  { id: "fasting", label: "Check fasting sugar", icon: "🩸" },
];
export const DEFAULT_EXTRAS: Extras = { routine: DEFAULT_ROUTINE, ticks: {}, walks: [], timer: null, reminders: DEFAULT_REMINDERS, checkinAt: null, wrapupDismissed: null };

export const DEFAULT_PROFILE: Profile = { display_name: null, meal_carb_target: 60, glucose_low: 70, glucose_high: 180, diet: "veg" };
export const EMPTY_STATE: State = { meals: [], readings: [], profile: DEFAULT_PROFILE, ...DEFAULT_EXTRAS };

// Readings are stored compactly as [epoch ms, mg/dL, source] so a year of CGM data fits in browser storage.
export type PersistedReading = [number, number, 0 | 1];
export type Persisted = { v: 1; meals: MealRow[]; readings: PersistedReading[]; profile: Profile } & Partial<Extras>;

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
    routine: state.routine,
    ticks: state.ticks,
    walks: state.walks,
    timer: state.timer,
    reminders: state.reminders,
    checkinAt: state.checkinAt,
    wrapupDismissed: state.wrapupDismissed,
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

const isIso = (v: unknown): v is string => typeof v === "string" && !Number.isNaN(new Date(v).getTime());
const isDay = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const isTime = (v: unknown): v is string => typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

function validExtras(d: Partial<Extras>): Extras {
  const routine: RoutineItem[] = Array.isArray(d.routine)
    ? d.routine
        .filter((r): r is RoutineItem => !!r && typeof r.id === "string" && typeof r.label === "string" && r.label.trim() !== "" && typeof r.icon === "string")
        .slice(0, 12)
        .map((r) => ({ id: r.id.slice(0, 40), label: r.label.trim().slice(0, 40), icon: r.icon.slice(0, 8) }))
    : DEFAULT_ROUTINE;

  const ticks: Record<string, string[]> = {};
  if (d.ticks && typeof d.ticks === "object") {
    for (const [day, ids] of Object.entries(d.ticks).slice(-400)) {
      if (isDay(day) && Array.isArray(ids)) ticks[day] = ids.filter((i): i is string => typeof i === "string").slice(0, 12);
    }
  }
  const walks: Walk[] = Array.isArray(d.walks)
    ? d.walks.filter((w): w is Walk => !!w && typeof w.id === "string" && isIso(w.started_at) && typeof w.minutes === "number" && w.minutes >= 1 && w.minutes <= 180).slice(-1000)
    : [];
  const t = d.timer;
  const timer = t && isIso(t.started_at) && typeof t.minutes === "number" && t.minutes >= 1 && t.minutes <= 60 ? { started_at: t.started_at, minutes: Math.round(t.minutes) } : null;
  const r = d.reminders;
  const reminders: Reminders = r && isTime(r.breakfast) && isTime(r.lunch) && isTime(r.dinner)
    ? { breakfast: r.breakfast, lunch: r.lunch, dinner: r.dinner, snack: isTime(r.snack) ? r.snack : null, checks: r.checks !== false, walks: r.walks !== false }
    : DEFAULT_REMINDERS;
  return { routine, ticks, walks, timer, reminders, checkinAt: isIso(d.checkinAt) ? d.checkinAt : null, wrapupDismissed: isDay(d.wrapupDismissed) ? d.wrapupDismissed : null };
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
  return { meals, readings, profile: validProfile(d.profile), ...validExtras(d) };
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
