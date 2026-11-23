// Server-only access to Supabase (Postgres) through its REST API. No client library, no browser access: the browser
// never sees these keys, and the tables have row level security with no policies (see supabase/schema.sql).
// When the two environment variables are missing, every function says "not enabled" and the app runs without a database.

export function dbEnabled(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}

type Init = { method?: string; body?: unknown; prefer?: string };

async function rest(path: string, init: Init = {}): Promise<Response> {
  const key = process.env.SUPABASE_SECRET_KEY!;
  const headers: Record<string, string> = { apikey: key, "Content-Type": "application/json" };
  // Legacy service-role keys are JWTs and also go in Authorization; the newer sb_secret_ keys use apikey only.
  if (key.startsWith("eyJ")) headers.Authorization = `Bearer ${key}`;
  if (init.prefer) headers.Prefer = init.prefer;
  return fetch(`${process.env.SUPABASE_URL!.replace(/\/$/, "")}/rest/v1/${path}`, {
    method: init.method ?? "GET",
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
}

const q = (v: string) => encodeURIComponent(v);

// Creates the profile on first sign-in (the database stamps trial_started_at) and returns it.
export async function ensureProfile(userId: string, email: string): Promise<{ trialStartMs: number; proUntilMs: number | null } | null> {
  try {
    await rest("profiles?on_conflict=user_id", { method: "POST", body: { user_id: userId, email }, prefer: "resolution=ignore-duplicates,return=minimal" });
    const res = await rest(`profiles?user_id=eq.${q(userId)}&select=trial_started_at,pro_until`);
    if (!res.ok) return null;
    const rows = (await res.json()) as { trial_started_at: string; pro_until: string | null }[];
    if (!rows[0]) return null;
    return { trialStartMs: new Date(rows[0].trial_started_at).getTime(), proUntilMs: rows[0].pro_until ? new Date(rows[0].pro_until).getTime() : null };
  } catch {
    return null;
  }
}

export async function usageToday(userId: string, kind: string): Promise<number | null> {
  try {
    const day = new Date().toISOString().slice(0, 10);
    const res = await rest(`ai_usage?user_id=eq.${q(userId)}&kind=eq.${q(kind)}&day=eq.${day}&select=count`);
    if (!res.ok) return null;
    const rows = (await res.json()) as { count: number }[];
    return rows[0]?.count ?? 0;
  } catch {
    return null;
  }
}

export async function bumpUsage(userId: string, kind: string): Promise<boolean> {
  try {
    const res = await rest("rpc/bump_ai_usage", { method: "POST", body: { p_user: userId, p_kind: kind } });
    return res.ok;
  } catch {
    return false;
  }
}

export type CloudCopy = { data: unknown; rev: number; updatedAt: string };

export async function readUserData(userId: string): Promise<CloudCopy | null | "error"> {
  try {
    const res = await rest(`user_data?user_id=eq.${q(userId)}&select=data,rev,updated_at`);
    if (!res.ok) return "error";
    const rows = (await res.json()) as { data: unknown; rev: number; updated_at: string }[];
    return rows[0] ? { data: rows[0].data, rev: Number(rows[0].rev), updatedAt: rows[0].updated_at } : null;
  } catch {
    return "error";
  }
}

// expectedRev 0 means "there is no cloud copy yet". Returns the new rev, "conflict" if another device saved first, or "error".
export async function saveUserData(userId: string, data: unknown, expectedRev: number): Promise<number | "conflict" | "error"> {
  try {
    const res = await rest("rpc/save_user_data", { method: "POST", body: { p_user: userId, p_data: data, p_expected_rev: expectedRev } });
    if (!res.ok) return "error";
    const rev = (await res.json()) as number | null;
    return rev === null ? "conflict" : Number(rev);
  } catch {
    return "error";
  }
}

export async function deleteUserData(userId: string): Promise<boolean> {
  try {
    const res = await rest(`user_data?user_id=eq.${q(userId)}`, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
}

export type ContactInput = { name: string; email: string; message: string };

// Saves a contact message and returns its id (null if the database isn't set up or the save failed).
export async function saveContact(c: ContactInput): Promise<string | null> {
  try {
    const res = await rest("contact_messages", { method: "POST", body: c, prefer: "return=representation" });
    if (!res.ok) return null;
    const rows = (await res.json()) as { id: string }[];
    return rows[0]?.id ?? null;
  } catch {
    return null;
  }
}

export async function markContact(id: string, patch: { notified?: boolean; replied?: boolean }): Promise<void> {
  try {
    await rest(`contact_messages?id=eq.${q(id)}`, { method: "PATCH", body: patch, prefer: "return=minimal" });
  } catch {
    // best effort
  }
}
