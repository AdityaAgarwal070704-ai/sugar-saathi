import type { MealRow } from "./types";

// Gentle streaks: counts consecutive days with at least one meal logged.
// A missed day is never framed as a failure: the UI says "welcome back".
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export type Streak = {
  current: number; // consecutive logged days ending today, or yesterday if today isn't logged yet
  loggedToday: boolean;
  loggedLast7: number; // days with a meal in the last 7 days (including today)
  state: "new" | "active" | "keep-going" | "welcome-back";
};

export function streakOf(meals: Pick<MealRow, "eaten_at">[], now: Date): Streak {
  const days = new Set(meals.map((m) => dayKey(new Date(m.eaten_at))));
  const loggedToday = days.has(dayKey(now));

  const cursor = new Date(now);
  cursor.setHours(12, 0, 0, 0);
  if (!loggedToday) cursor.setDate(cursor.getDate() - 1);
  let current = 0;
  while (days.has(dayKey(cursor))) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }

  let loggedLast7 = 0;
  const c7 = new Date(now);
  c7.setHours(12, 0, 0, 0);
  for (let i = 0; i < 7; i++) {
    if (days.has(dayKey(c7))) loggedLast7++;
    c7.setDate(c7.getDate() - 1);
  }

  let state: Streak["state"];
  if (days.size === 0) state = "new";
  else if (loggedToday) state = "active";
  else if (current > 0) state = "keep-going";
  else state = "welcome-back";
  return { current, loggedToday, loggedLast7, state };
}
