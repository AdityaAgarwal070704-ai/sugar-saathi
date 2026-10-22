// Best-effort abuse guard for the AI routes, since there are no accounts.
// Memory is per server instance, so this limits bursts, not a determined attacker.
const hits = new Map<string, number[]>();

export function tooMany(request: Request, bucket: string, max: number, windowMs = 3600_000): boolean {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
  return false;
}
