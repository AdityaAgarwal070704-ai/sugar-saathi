"use client";

import { useState } from "react";
import { parseGlucoseCsv } from "@/lib/csv";
import { store } from "@/lib/store";

export default function CsvImport() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setMsg(null);
    if (file.size > 15 * 1024 * 1024) return setMsg({ ok: false, text: "That file is too large (limit 15 MB)." });
    setBusy(true);
    try {
      const result = parseGlucoseCsv(await file.text());
      if (result.error) return setMsg({ ok: false, text: result.error });
      if (result.readings.length === 0) return setMsg({ ok: false, text: "I couldn't read any valid glucose values from that file." });
      const { added, saved } = store.addReadings(result.readings.map((r) => ({ ...r, source: "csv" as const })));
      if (!saved) return setMsg({ ok: false, text: "Your browser couldn't save that many readings (storage is full). Export a backup from Settings and clear old data, or import a shorter date range." });
      setMsg({
        ok: true,
        text: `Imported ${added} new readings (${result.unit})${result.readings.length - added > 0 ? `, ${result.readings.length - added} already saved` : ""}${result.skipped ? `, skipped ${result.skipped} unreadable rows` : ""}.`,
      });
    } catch {
      setMsg({ ok: false, text: "Couldn't read that file." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-line bg-paper px-5 font-medium hover:bg-sand">
        {busy ? "Importing…" : "Choose a CSV file"}
        <input type="file" accept=".csv,text/csv" className="hidden" disabled={busy} onChange={onFile} />
      </label>
      <p className="text-xs text-muted">Works with LibreView and similar exports (a time column and a glucose column, mg/dL or mmol/L). Dates are read day-first unless the file shows otherwise. The file is read on your device and never uploaded.</p>
      {msg && <p role="alert" className={`text-sm ${msg.ok ? "text-leaf" : "text-terracotta"}`}>{msg.text}</p>}
    </div>
  );
}
