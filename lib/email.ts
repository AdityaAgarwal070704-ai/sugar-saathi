// Sends email through Resend's REST API. Needs RESEND_API_KEY; without it every send reports "not sent".
export function emailEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendEmail(opts: { to: string; subject: string; text: string; replyTo?: string }): Promise<boolean> {
  if (!emailEnabled()) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Sugar Saathi <onboarding@resend.dev>",
        to: [opts.to],
        subject: opts.subject,
        text: opts.text,
        reply_to: opts.replyTo,
      }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
