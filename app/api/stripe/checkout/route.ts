import { supabaseConfigured } from "@/lib/supabase/config";
import { getStripe, siteUrl } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!supabaseConfigured) return Response.json({ error: "The app isn't fully set up yet (database missing)." }, { status: 503 });
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return Response.json({ error: "Please sign in first." }, { status: 401 });

  const stripe = getStripe();
  const price = process.env.STRIPE_PRICE_ID;
  if (!stripe || !price) return Response.json({ error: "Payments aren't set up yet." }, { status: 503 });

  const { data: profile } = await supabase.from("profiles").select("plan, stripe_customer_id").eq("id", auth.user.id).single();
  if (profile?.plan === "pro") return Response.json({ error: "You're already on Pro." }, { status: 400 });

  try {
    const base = siteUrl(request);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      client_reference_id: auth.user.id,
      ...(profile?.stripe_customer_id ? { customer: profile.stripe_customer_id } : { customer_email: auth.user.email }),
      subscription_data: { metadata: { user_id: auth.user.id } },
      allow_promotion_codes: true,
      success_url: `${base}/app/settings?upgraded=1`,
      cancel_url: `${base}/pricing`,
    });
    return Response.json({ url: session.url });
  } catch {
    return Response.json({ error: "Couldn't start checkout. Try again." }, { status: 502 });
  }
}
