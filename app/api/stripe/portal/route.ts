import { supabaseConfigured } from "@/lib/supabase/config";
import { getStripe, siteUrl } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!supabaseConfigured) return Response.json({ error: "The app isn't fully set up yet (database missing)." }, { status: 503 });
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return Response.json({ error: "Please sign in first." }, { status: 401 });
  const stripe = getStripe();
  if (!stripe) return Response.json({ error: "Payments aren't set up yet." }, { status: 503 });

  const { data: profile } = await supabase.from("profiles").select("stripe_customer_id").eq("id", auth.user.id).single();
  if (!profile?.stripe_customer_id) return Response.json({ error: "No billing account found yet." }, { status: 404 });
  try {
    const session = await stripe.billingPortal.sessions.create({ customer: profile.stripe_customer_id, return_url: `${siteUrl(request)}/app/settings` });
    return Response.json({ url: session.url });
  } catch {
    return Response.json({ error: "Couldn't open billing. Try again." }, { status: 502 });
  }
}
