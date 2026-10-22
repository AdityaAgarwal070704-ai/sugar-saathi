"use client";

import { useSyncExternalStore } from "react";
import { dayKey } from "./day";
import { EMPTY_STATE, fromPersisted, mergeReadings, toPersisted, type State } from "./store-core";
import type { Recipe } from "./recipe";
import type { Food, MealRow, Profile, Reminders, RoutineItem } from "./types";

// All user data lives in this browser (localStorage). No accounts, no server database.
const LEGACY_KEY = "sugar-saathi:v1";
// With login, each account gets its own storage slot, so two people on one phone never see each other's data.
let activeKey = LEGACY_KEY;
const handledKey = (userId: string) => `sugar-saathi:legacy-handled:${userId}`;

let cache: State | null = null;
const listeners = new Set<() => void>();

function load(): State {
  try {
    const raw = window.localStorage.getItem(activeKey);
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
    window.localStorage.setItem(activeKey, JSON.stringify(toPersisted(next)));
  } catch {
    ok = false;
  }
  emit();
  return ok;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === activeKey || e.key === null) {
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

function legacyHasData(): boolean {
  try {
    const raw = window.localStorage.getItem(LEGACY_KEY);
    if (!raw) return false;
    const parsed = fromPersisted(JSON.parse(raw));
    return Boolean(parsed && (parsed.meals.length > 0 || parsed.readings.length > 0 || parsed.recipes.length > 0));
  } catch {
    return false;
  }
}

export const store = {
  // Switches to a signed-in user's own data (or back to the shared slot when signed out / no login).
  setUser(userId: string | null): void {
    const next = userId ? `${LEGACY_KEY}:${userId}` : LEGACY_KEY;
    if (next === activeKey) return;
    activeKey = next;
    cache = null;
    emit();
  },
  // Data saved on this device before accounts existed. Offered once to the first account that signs in.
  hasLegacyData(userId: string): boolean {
    if (activeKey === LEGACY_KEY) return false;
    try {
      if (window.localStorage.getItem(handledKey(userId))) return false;
      if (window.localStorage.getItem(activeKey)) return false; // this account already has its own data
    } catch {
      return false;
    }
    return legacyHasData();
  },
  adoptLegacy(userId: string): boolean {
    try {
      const raw = window.localStorage.getItem(LEGACY_KEY);
      const parsed = raw ? fromPersisted(JSON.parse(raw)) : null;
      if (!parsed) return false;
      const ok = commit(parsed);
      window.localStorage.setItem(handledKey(userId), "1");
      if (ok) window.localStorage.removeItem(LEGACY_KEY); // so a second account is not offered the same data
      return ok;
    } catch {
      return false;
    }
  },
  dismissLegacy(userId: string): void {
    try {
      window.localStorage.setItem(handledKey(userId), "1");
    } catch {
      // ignore
    }
    emit();
  },
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
  // Saves (or updates) a recipe together with the "my dish" it creates in the food list.
  saveRecipe(recipe: Recipe, food: Food): boolean {
    const s = getSnapshot();
    const recipes = [...s.recipes.filter((r) => r.id !== recipe.id), recipe];
    const customFoods = [...s.customFoods.filter((f) => f.id !== food.id), food];
    return commit({ ...s, recipes, customFoods });
  },
  deleteRecipe(id: string): boolean {
    const s = getSnapshot();
    const r = s.recipes.find((x) => x.id === id);
    if (!r) return true;
    return commit({ ...s, recipes: s.recipes.filter((x) => x.id !== id), customFoods: s.customFoods.filter((f) => f.id !== r.foodId) });
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
      window.localStorage.removeItem(activeKey);
    } catch {
      // ignore
    }
  },
};
