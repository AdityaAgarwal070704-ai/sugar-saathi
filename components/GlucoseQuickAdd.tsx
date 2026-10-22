"use client";

import { useState } from "react";
import { parseReading } from "@/lib/glucose";
import { store } from "@/lib/store";

function nowLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function GlucoseQuickAdd({ compact = false, defaultTime }: { compact?: boolean; defaultTime?: string }) {
  const [value, setValue] = useState("");
  const [time, setTime] = useState(defaultTime ?? nowLocal());
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(false);
    const parsed = parseReading(value);
    if (!parsed.ok) return setError(parsed.message);
    const when = new Date(time);
    if (Number.isNaN(when.getTime())) return setError("Pick a valid date and time.");
    if (when.getTime() > Date.now() + 5 * 60_000) return setError("That time is in the future.");
    const { added, saved: ok } = store.addReadings([{ measured_at: when.toISOString(), value: parsed.value, source: "manual" }]);
    if (!ok) return setError("Your browser couldn't save this (storage is full or blocked). Export a backup from Settings and clear old data.");
    if (added === 0) return setError("You already saved that exact reading.");
    setError(null);
    setValue("");
    setSaved(true);
  };

  return (
    <div className={compact ? "flex flex-wrap items-start gap-2" : "space-y-2"}>
      <div className="flex flex-wrap items-center gap-2">
        <input inputMode="numeric" placeholder="mg/dL" aria-label="Glucose reading in mg/dL" className="w-24 rounded border border-zinc-300 px-2 py-1" value={value} onChange={(e) => setValue(e.target.value)} />
        {!compact && (
          <input type="datetime-local" aria-label="When" className="rounded border border-zinc-300 px-2 py-1" value={time} onChange={(e) => setTime(e.target.value)} />
        )}
        <button type="button" onClick={save} className="rounded border border-zinc-300 px-3 py-1 text-sm">Save reading</button>
      </div>
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
      {saved && <p className="text-xs text-emerald-800">Saved.</p>}
    </div>
  );
}
