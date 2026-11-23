import { dbEnabled, markContact, saveContact } from "@/lib/db";
import { emailEnabled, sendEmail } from "@/lib/email";
import { tooMany } from "@/lib/ratelimit";

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim().slice(0, max) : "");

export async function POST(request: Request) {
  if (tooMany(request, "contact", 5)) return Response.json({ error: "Too many messages. Please try again later." }, { status: 429 });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }
  if (clean(body.website, 100)) return Response.json({ ok: true }); // hidden field: bots fill it, people don't
  const name = clean(body.name, 100).replace(/[\r\n]+/g, " ");
  const email = clean(body.email, 200);
  const message = clean(body.message, 2000);
  if (!name || !EMAIL.test(email) || message.length < 5) return Response.json({ error: "Please add your name, a valid email and a short message." }, { status: 400 });
  if (!dbEnabled()) return Response.json({ error: "Messages are not set up on this site yet." }, { status: 503 });

  const id = await saveContact({ name, email, message });
  if (!id) return Response.json({ error: "Couldn't save your message. Please try again." }, { status: 502 });

  let notified = false;
  let replied = false;
  if (emailEnabled()) {
    const owner = process.env.NOTIFY_EMAIL;
    if (owner) {
      notified = await sendEmail({ to: owner, replyTo: email, subject: `New message from ${name} on Sugar Saathi`, text: `Name: ${name}\nEmail: ${email}\n\n${message}\n\n(Saved in Supabase, contact_messages, id ${id})` });
    }
    replied = await sendEmail({
      to: email,
      subject: "Thanks for contacting Sugar Saathi",
      text: `Hi ${name},\n\nThanks for your message. We got it and will reply soon.\n\nYour message:\n"${message}"\n\nSugar Saathi gives food guidance only, not medical advice. For anything about medicines or doses, please speak to your doctor or diabetes educator.\n\n- Sugar Saathi`,
    });
  }
  await markContact(id, { notified, replied });
  return Response.json({ ok: true, emailed: replied });
}
