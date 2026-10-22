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

export const FREE_AI_LOGS_PER_DAY = 3;
export const FREE_HISTORY_DAYS = 7;
export const PRO_HISTORY_DAYS = 365;
export const PRO_PRICE_LABEL = process.env.NEXT_PUBLIC_PRO_PRICE_LABEL ?? "₹299 / month";
