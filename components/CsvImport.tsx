"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseGlucoseCsv } from "@/lib/csv";

export default function CsvImport() {
  const router = useRouter();
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
      let imported = 0;
      for (let i = 0; i < result.readings.length; i += 2000) {
        const chunk = result.readings.slice(i, i + 2000);
        const res = await fetch("/api/glucose/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ readings: chunk }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) return setMsg({ ok: false, text: data?.error ?? "Import failed. Try again." });
        imported += data.received ?? chunk.length;
      }
      setMsg({ ok: true, text: `Imported ${imported} readings (${result.unit})${result.skipped ? `, skipped ${result.skipped} unreadable rows` : ""}. Duplicates are ignored.` });
      router.refresh();
    } catch {
      setMsg({ ok: false, text: "Couldn't read that file." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="inline-block cursor-pointer rounded-lg border border-zinc-300 px-4 py-2 text-sm">
        {busy ? "Importing…" : "Choose a CSV file"}
        <input type="file" accept=".csv,text/csv" className="hidden" disabled={busy} onChange={onFile} />
      </label>
      <p className="text-xs text-zinc-500">Works with LibreView and similar exports (a time column and a glucose column, mg/dL or mmol/L). Dates are read day-first unless the file shows otherwise.</p>
      {msg && <p role="alert" className={`text-sm ${msg.ok ? "text-emerald-800" : "text-red-700"}`}>{msg.text}</p>}
    </div>
  );
}
