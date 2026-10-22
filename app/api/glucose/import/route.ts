import { supabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

// Bulk glucose import. Each reading is validated again here (never trust the browser).
export async function POST(request: Request) {
  if (!supabaseConfigured) return Response.json({ error: "The app isn't fully set up yet (database missing)." }, { status: 503 });
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return Response.json({ error: "Please sign in." }, { status: 401 });

  let body: { readings?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }
  if (!Array.isArray(body.readings) || body.readings.length === 0 || body.readings.length > 2000) {
    return Response.json({ error: "Send between 1 and 2000 readings at a time." }, { status: 400 });
  }

  const now = Date.now();
  const rows: { user_id: string; measured_at: string; value: number; source: "csv" }[] = [];
  for (const r of body.readings as { measured_at?: unknown; value?: unknown }[]) {
    const t = typeof r.measured_at === "string" ? new Date(r.measured_at).getTime() : NaN;
    const v = typeof r.value === "number" ? Math.round(r.value) : NaN;
    if (!Number.isFinite(t) || t > now + 5 * 60_000 || t < now - 5 * 365 * 86400_000) continue;
    if (!Number.isFinite(v) || v < 40 || v > 600) continue;
    rows.push({ user_id: auth.user.id, measured_at: new Date(t).toISOString(), value: v, source: "csv" });
  }
  if (rows.length === 0) return Response.json({ error: "No valid readings in that file." }, { status: 400 });

  const { error } = await supabase.from("readings").upsert(rows, { onConflict: "user_id,measured_at,value", ignoreDuplicates: true });
  if (error) return Response.json({ error: "Couldn't save the readings. Try again." }, { status: 500 });
  return Response.json({ received: rows.length });
}
