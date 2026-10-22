"use client";

import { useState } from "react";

export function UpgradeButton({ label = "Upgrade to Pro" }: { label?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const go = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.url) window.location.href = data.url;
      else setError(data?.error ?? "Couldn't start checkout. Try again.");
    } catch {
      setError("Couldn't start checkout. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <span>
      <button type="button" disabled={busy} onClick={go} className="rounded-lg bg-emerald-700 px-4 py-2 text-white disabled:opacity-50">
        {busy ? "Opening checkout…" : label}
      </button>
      {error && <span className="ml-3 text-sm text-red-700">{error}</span>}
    </span>
  );
}

export function ManageBillingButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const go = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.url) window.location.href = data.url;
      else setError(data?.error ?? "Couldn't open billing. Try again.");
    } catch {
      setError("Couldn't open billing. Try again.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <span>
      <button type="button" disabled={busy} onClick={go} className="rounded-lg border border-zinc-300 px-4 py-2 disabled:opacity-50">
        {busy ? "Opening…" : "Manage billing"}
      </button>
      {error && <span className="ml-3 text-sm text-red-700">{error}</span>}
    </span>
  );
}

export function LockedCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
      <h2 className="text-lg font-semibold">{title} <span className="ml-1 rounded bg-emerald-700 px-2 py-0.5 text-xs text-white">Pro</span></h2>
      <div className="mt-1 text-sm text-zinc-700">{children}</div>
      <div className="mt-3">
        <UpgradeButton />
      </div>
    </section>
  );
}
