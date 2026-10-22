import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

// Server-only, bypasses row-level security. Used only by the Stripe webhook to set a user's plan.
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || !SUPABASE_URL) return null;
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false } });
}
