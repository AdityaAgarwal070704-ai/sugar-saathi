"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { WeekStats } from "@/lib/stats";
import type { Profile } from "@/lib/types";

type Result = { summary: string; links: { title: string; detail: string }[]; suggestions: string[] };

export default function InsightsAI({ stats, goals }: { stats: WeekStats; goals: Pick<Profile, "meal_carb_target" | "glucose_low" | "glucose_high"> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    setBlocked(false);
    try {
      const res = await fetch("/api/insights", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stats, goals }) });
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
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl font-semibold">AI weekly summary</h2>
        <Button size="sm" disabled={busy} onClick={run}>
          {busy ? "Writing…" : result ? "Refresh" : "Generate summary"}
        </Button>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-terracotta">{error}</p>}
      {blocked && <p className="mt-2 text-sm text-saffron-ink">The AI text was blocked by the safety filter, so nothing is shown. The rule-based insights above are unaffected. Try again.</p>}
      {result && (
        <div className="mt-3 space-y-3 text-sm">
          <p>{result.summary}</p>
          {result.links.length > 0 && (
            <div>
              <h3 className="font-semibold">Possible links to discuss with your educator</h3>
              <ul className="list-disc pl-5 text-ink">{result.links.map((l) => <li key={l.title}><strong>{l.title}.</strong> {l.detail}</li>)}</ul>
            </div>
          )}
          {result.suggestions.length > 0 && (
            <div>
              <h3 className="font-semibold">Food ideas for next week</h3>
              <ul className="list-disc pl-5 text-ink">{result.suggestions.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
          )}
          <p className="text-xs text-muted">Written by AI from your own numbers. Not medical advice.</p>
        </div>
      )}
    </Card>
  );
}
