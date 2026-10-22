"use client";

import { useState } from "react";

type Result = { summary: string; links: { title: string; detail: string }[]; suggestions: string[] };

export default function InsightsAI() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    setBlocked(false);
    try {
      const res = await fetch("/api/insights", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) return setError(data?.error ?? "Couldn't reach the AI, try again.");
      if (data.blocked) return setBlocked(true);
      setResult(data as Result);
    } catch {
      setError("Couldn't reach the AI, try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">AI weekly summary <span className="ml-1 rounded bg-emerald-700 px-2 py-0.5 text-xs text-white">Pro</span></h2>
        <button type="button" disabled={busy} onClick={run} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm text-white disabled:opacity-50">
          {busy ? "Writing…" : result ? "Refresh" : "Generate summary"}
        </button>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
      {blocked && <p className="mt-2 text-sm text-amber-800">The AI text was blocked by the safety filter, so nothing is shown. The rule-based insights above are unaffected. Try again.</p>}
      {result && (
        <div className="mt-3 space-y-3 text-sm">
          <p>{result.summary}</p>
          {result.links.length > 0 && (
            <div>
              <h3 className="font-semibold">Possible links to discuss with your educator</h3>
              <ul className="list-disc pl-5 text-zinc-700">{result.links.map((l) => <li key={l.title}><strong>{l.title}.</strong> {l.detail}</li>)}</ul>
            </div>
          )}
          {result.suggestions.length > 0 && (
            <div>
              <h3 className="font-semibold">Food ideas for next week</h3>
              <ul className="list-disc pl-5 text-zinc-700">{result.suggestions.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
          )}
          <p className="text-xs text-zinc-500">Written by AI from your own numbers. Not medical advice.</p>
        </div>
      )}
    </section>
  );
}
