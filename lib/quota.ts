import { bumpUsage, dbEnabled, usageToday } from "./db";

// Daily caps per signed-in user for AI requests. With the database configured the counts live there (exact, shared by all
// server instances). Without it, or if it can't be reached, they live in server memory: per instance and reset on restarts,
// good for stopping runaway use, not an exact meter.
// Pro-only AI routes are enforced exactly by plan (see lib/auth/server.ts), not by these counters.
const WINDOW = 24 * 3600_000;
const hits = new Map<string, number[]>();

const recent = (key: string, now: number) => (hits.get(key) ?? []).filter((t) => now - t < WINDOW);

export function usedToday(userId: string, kind: string, now = Date.now()): number {
  return recent(`${userId}:${kind}`, now).length;
}

export function recordUse(userId: string, kind: string, now = Date.now()): void {
  const key = `${userId}:${kind}`;
  hits.set(key, [...recent(key, now), now]);
  if (hits.size > 20000) for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW)) hits.delete(k);
}

export function resetQuotaForTests() {
  hits.clear();
}

export async function usedTodayAsync(userId: string, kind: string): Promise<number> {
  if (dbEnabled()) {
    const n = await usageToday(userId, kind);
    if (n !== null) return n;
  }
  return usedToday(userId, kind);
}

export async function recordUseAsync(userId: string, kind: string): Promise<void> {
  if (dbEnabled() && (await bumpUsage(userId, kind))) return;
  recordUse(userId, kind);
}
