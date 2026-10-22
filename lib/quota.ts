// Best-effort daily caps per signed-in user for AI requests. With no database, counts live in server memory, so they are
// per server instance and reset on restarts: good for stopping runaway use, not an exact meter.
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
