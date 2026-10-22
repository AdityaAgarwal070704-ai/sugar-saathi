import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import type { Profile } from "./types";

// Returns the signed-in user and their profile, or sends them to the login page.
export async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
  return { supabase, user: data.user, profile: profile as Profile | null };
}

// Payments aren't built yet, so every signed-in user gets every feature.
// A fair-use cap keeps AI costs bounded.
export const AI_LOGS_PER_DAY = 30;
export const HISTORY_DAYS = 365;
