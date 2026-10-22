import type { SupabaseClient } from "@supabase/supabase-js";
import type { MealRow, ReadingRow } from "./types";

// Loads every row (Supabase returns at most 1000 per request, and CGM files have thousands of readings).
async function fetchAll<T>(page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; from < 50000; from += 1000) {
    const { data, error } = await page(from, from + 999);
    if (error || !data) break;
    out.push(...data);
    if (data.length < 1000) break;
  }
  return out;
}

export async function loadMeals(supabase: SupabaseClient, days: number): Promise<MealRow[]> {
  const since = new Date(Date.now() - days * 86400_000).toISOString();
  return fetchAll<MealRow>((from, to) =>
    supabase.from("meals").select("*").gte("eaten_at", since).order("eaten_at", { ascending: false }).range(from, to),
  );
}

export async function loadReadings(supabase: SupabaseClient, days: number): Promise<ReadingRow[]> {
  // A little extra at the start so the first meal's before-reading is included.
  const since = new Date(Date.now() - days * 86400_000 - 3600_000).toISOString();
  return fetchAll<ReadingRow>((from, to) =>
    supabase.from("readings").select("id,measured_at,value,source").gte("measured_at", since).order("measured_at", { ascending: false }).range(from, to),
  );
}

export async function aiUsedToday(supabase: SupabaseClient, kind: string): Promise<number> {
  const since = new Date(Date.now() - 24 * 3600_000).toISOString();
  const { count } = await supabase.from("ai_usage").select("id", { count: "exact", head: true }).eq("kind", kind).gte("created_at", since);
  return count ?? 0;
}
