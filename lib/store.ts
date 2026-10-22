"use client";

import { useSyncExternalStore } from "react";
import { dayKey } from "./day";
import { EMPTY_STATE, fromPersisted, mergeReadings, toPersisted, type State } from "./store-core";
import type { MealRow, Profile, Reminders, RoutineItem } from "./types";

// All user data lives in this browser (localStorage). No accounts, no server database.
const KEY = "sugar-saathi:v1";

let cache: State | null = null;
const listeners = new Set<() => void>();

function load(): State {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = fromPersisted(JSON.parse(raw));
      if (parsed) return parsed;
    }
  } catch {
    // Storage blocked or data corrupted: start empty.
  }
  return EMPTY_STATE;
}

function emit() {
  listeners.forEach((l) => l());
}

// Returns false if the browser refused to save (storage full or blocked).
function commit(next: State): boolean {
  cache = next;
  let ok = true;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(toPersisted(next)));
  } catch {
    ok = false;
  }
  emit();
  return ok;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) {
      cache = null;
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => (cache ??= load());
const getServerSnapshot = () => EMPTY_STATE;

export function useStore(): State & { ready: boolean } {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  return { ...state, ready };
}

export const store = {
  addMeal(meal: Omit<MealRow, "id">): { ok: boolean; id: string } {
    const s = getSnapshot();
    const row: MealRow = { ...meal, id: crypto.randomUUID() };
    const ok = commit({ ...s, meals: [row, ...s.meals].sort((a, b) => b.eaten_at.localeCompare(a.eaten_at)) });
    return { ok, id: row.id };
  },
  updateMeal(id: string, patch: Partial<Omit<MealRow, "id">>): boolean {
    const s = getSnapshot();
    return commit({ ...s, meals: s.meals.map((m) => (m.id === id ? { ...m, ...patch } : m)).sort((a, b) => b.eaten_at.localeCompare(a.eaten_at)) });
  },
  deleteMeal(id: string): boolean {
    const s = getSnapshot();
    return commit({ ...s, meals: s.meals.filter((m) => m.id !== id) });
  },
  addReadings(incoming: { measured_at: string; value: number; source: "manual" | "csv" }[]): { added: number; saved: boolean } {
    const s = getSnapshot();
    const { readings, added } = mergeReadings(s.readings, incoming);
    if (added === 0) return { added: 0, saved: true };
    return { added, saved: commit({ ...s, readings }) };
  },
  setProfile(profile: Profile): boolean {
    return commit({ ...getSnapshot(), profile });
  },
  toggleTick(day: string, itemId: string): boolean {
    const s = getSnapshot();
    const cur = s.ticks[day] ?? [];
    const next = cur.includes(itemId) ? cur.filter((i) => i !== itemId) : [...cur, itemId];
    return commit({ ...s, ticks: { ...s.ticks, [day]: next } });
  },
  setRoutine(routine: RoutineItem[]): boolean {
    return commit({ ...getSnapshot(), routine: routine.slice(0, 12) });
  },
  setReminders(reminders: Reminders): boolean {
    return commit({ ...getSnapshot(), reminders });
  },
  startTimer(minutes = 10): boolean {
    return commit({ ...getSnapshot(), timer: { started_at: new Date().toISOString(), minutes } });
  },
  cancelTimer(): boolean {
    return commit({ ...getSnapshot(), timer: null });
  },
  // Logs the finished walk, clears the timer and ticks the "walk" routine item for today.
  finishTimer(): boolean {
    const s = getSnapshot();
    if (!s.timer) return true;
    const walk = { id: crypto.randomUUID(), started_at: s.timer.started_at, minutes: s.timer.minutes };
    const today = dayKey(new Date());
    const cur = s.ticks[today] ?? [];
    const ticks = s.routine.some((r) => r.id === "walk") && !cur.includes("walk") ? { ...s.ticks, [today]: [...cur, "walk"] } : s.ticks;
    return commit({ ...s, walks: [...s.walks, walk].slice(-1000), timer: null, ticks });
  },
  markCheckin(): boolean {
    return commit({ ...getSnapshot(), checkinAt: new Date().toISOString() });
  },
  dismissWrapup(day: string): boolean {
    return commit({ ...getSnapshot(), wrapupDismissed: day });
  },
  exportJson(): string {
    return JSON.stringify(toPersisted(getSnapshot()));
  },
  // Replaces everything with a backup file. Returns counts, or null if the file isn't a valid backup.
  importJson(text: string): { meals: number; readings: number; saved: boolean } | null {
    try {
      const next = fromPersisted(JSON.parse(text));
      if (!next) return null;
      const saved = commit(next);
      return { meals: next.meals.length, readings: next.readings.length, saved };
    } catch {
      return null;
    }
  },
  clearAll(): void {
    commit(EMPTY_STATE);
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  },
};
