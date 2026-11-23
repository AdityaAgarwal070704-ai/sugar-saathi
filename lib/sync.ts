"use client";

import { useSyncExternalStore } from "react";
import { store } from "./store";
import { fromPersisted, mergeStates, toPersisted } from "./store-core";

// Keeps the cloud copy and this device in step (Pro and trial users, signed in). The device always works on its own;
// sync only merges with the cloud copy, and never deletes anything that isn't marked as deleted.
export type SyncState = { phase: "off" | "idle" | "syncing" | "synced" | "error"; at: string | null; message: string | null };

let state: SyncState = { phase: "off", at: null, message: null };
const listeners = new Set<() => void>();
const set = (next: Partial<SyncState>) => {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
};

export function useSyncState(): SyncState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}

const json = (s: unknown) => JSON.stringify(s);
let running = false;
let again = false;
let timer: ReturnType<typeof setTimeout> | null = null;

async function run(): Promise<void> {
  if (running) {
    again = true;
    return;
  }
  running = true;
  set({ phase: "syncing", message: null });
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await fetch("/api/sync", { cache: "no-store" });
      const got = (await res.json().catch(() => ({}))) as { enabled?: boolean; error?: string; copy?: { data: unknown; rev: number } | null };
      if (got.enabled === false) {
        set({ phase: "off", message: got.error ?? null });
        return;
      }
      if (!res.ok) {
        set({ phase: "error", message: got.error ?? "Couldn't reach the cloud copy." });
        return;
      }
      const local = store.getState();
      const remote = got.copy ? fromPersisted(got.copy.data) : null;
      const merged = remote ? mergeStates(local, remote) : local;
      if (json(toPersisted(merged)) !== json(toPersisted(local))) store.applySynced(merged);
      if (remote && json(toPersisted(remote)) === json(toPersisted(merged))) {
        set({ phase: "synced", at: new Date().toISOString() });
        return;
      }
      const put = await fetch("/api/sync", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: json({ data: toPersisted(merged), expectedRev: got.copy ? got.copy.rev : 0 }),
      });
      if (put.status === 409) continue; // another device saved in between: read, merge and try again
      if (!put.ok) {
        const err = (await put.json().catch(() => ({}))) as { error?: string };
        set({ phase: "error", message: err.error ?? "Couldn't save the cloud copy." });
        return;
      }
      set({ phase: "synced", at: new Date().toISOString() });
      return;
    }
    set({ phase: "error", message: "Another device was saving. We'll try again shortly." });
  } catch {
    set({ phase: "error", message: "You seem to be offline. Your data on this device is safe; we'll retry." });
  } finally {
    running = false;
    if (again) {
      again = false;
      schedule(1500);
    }
  }
}

function schedule(ms: number) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => void run(), ms);
}

export const syncNow = () => run();

// Starts syncing: once now, again a few seconds after each change made here, and when the tab comes back or the phone goes online.
export function startSync(): () => void {
  set({ phase: "idle" });
  void run();
  const offLocal = store.onLocalChange(() => schedule(4000));
  const onBack = () => {
    if (document.visibilityState === "visible") schedule(500);
  };
  document.addEventListener("visibilitychange", onBack);
  window.addEventListener("online", onBack);
  return () => {
    offLocal();
    document.removeEventListener("visibilitychange", onBack);
    window.removeEventListener("online", onBack);
    if (timer) clearTimeout(timer);
    set({ phase: "off", message: null });
  };
}

// Removes this account's cloud copy (allowed on any plan). Returns true when it is gone or there never was one.
export async function deleteCloudCopy(): Promise<boolean> {
  try {
    const res = await fetch("/api/sync", { method: "DELETE" });
    const got = (await res.json().catch(() => ({}))) as { enabled?: boolean };
    return got.enabled === false || res.ok;
  } catch {
    return false;
  }
}
