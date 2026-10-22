"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { parseReading } from "@/lib/glucose";

function nowLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function GlucoseQuickAdd({ compact = false, defaultTime }: { compact?: boolean; defaultTime?: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [time, setTime] = useState(defaultTime ?? nowLocal());
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setSaved(false);
    const parsed = parseReading(value);
    if (!parsed.ok) return setError(parsed.message);
    const when = new Date(time);
    if (Number.isNaN(when.getTime())) return setError("Pick a valid date and time.");
    if (when.getTime() > Date.now() + 5 * 60_000) return setError("That time is in the future.");
    setBusy(true);
    setError(null);
    const { error: err } = await createClient().from("readings").insert({ value: parsed.value, measured_at: when.toISOString(), source: "manual" });
    setBusy(false);
    if (err) return setError(err.code === "23505" ? "You already saved that exact reading." : "Couldn't save the reading. Try again.");
    setValue("");
    setSaved(true);
    router.refresh();
  };

  return (
    <div className={compact ? "flex flex-wrap items-start gap-2" : "space-y-2"}>
      <div className="flex flex-wrap items-center gap-2">
        <input inputMode="numeric" placeholder="mg/dL" aria-label="Glucose reading in mg/dL" className="w-24 rounded border border-zinc-300 px-2 py-1" value={value} onChange={(e) => setValue(e.target.value)} />
        {!compact && (
          <input type="datetime-local" aria-label="When" className="rounded border border-zinc-300 px-2 py-1" value={time} onChange={(e) => setTime(e.target.value)} />
        )}
        <button type="button" disabled={busy} onClick={save} className="rounded border border-zinc-300 px-3 py-1 text-sm disabled:opacity-50">
          {busy ? "Saving…" : "Save reading"}
        </button>
      </div>
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
      {saved && <p className="text-xs text-emerald-800">Saved.</p>}
    </div>
  );
}
