import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// Stripe tells us when someone pays or cancels. This is the only place a user's plan is changed.
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const admin = createAdminClient();
  if (!stripe || !secret || !admin) return new Response("Not configured", { status: 503 });

  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return new Response("Bad signature", { status: 400 });
  }

  const customerId = (c: string | Stripe.Customer | Stripe.DeletedCustomer | null) => (typeof c === "string" ? c : (c?.id ?? null));

  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    const userId = s.client_reference_id;
    const customer = customerId(s.customer);
    if (userId && customer && s.payment_status !== "unpaid") {
      await admin.from("profiles").update({ plan: "pro", stripe_customer_id: customer }).eq("id", userId);
    }
  } else if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    const customer = customerId(sub.customer);
    const active = event.type !== "customer.subscription.deleted" && (sub.status === "active" || sub.status === "trialing");
    if (customer) await admin.from("profiles").update({ plan: active ? "pro" : "free" }).eq("stripe_customer_id", customer);
  }
  return new Response("ok");
}
