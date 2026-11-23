"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

const field = "mt-1 w-full rounded-2xl border border-line bg-paper px-4 py-3 text-base";

export default function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: f.get("name"), email: f.get("email"), message: f.get("message"), website: f.get("website") }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div role="status" className="mt-6 rounded-3xl bg-moss-soft p-6">
        <p className="font-display text-xl font-semibold text-leaf">Thank you, your message is in.</p>
        <p className="mt-1 text-muted">We&apos;ve sent a confirmation to your email. Check spam if you don&apos;t see it.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block text-sm font-medium">Your name
        <input name="name" required maxLength={100} autoComplete="name" className={field} />
      </label>
      <label className="block text-sm font-medium">Your email
        <input name="email" type="email" required maxLength={200} autoComplete="email" className={field} />
      </label>
      <label className="block text-sm font-medium">Message
        <textarea name="message" required minLength={5} maxLength={2000} rows={5} className={field} />
      </label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      {error && <p role="alert" className="text-sm text-terracotta">{error}</p>}
      <Button type="submit" size="lg" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send message"}</Button>
    </form>
  );
}
