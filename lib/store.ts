"use client";

import { useSyncExternalStore } from "react";
import { EMPTY_STATE, fromPersisted, mergeReadings, toPersisted, type State } from "./store-core";
import type { MealRow, Profile } from "./types";

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
