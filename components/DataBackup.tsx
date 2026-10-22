"use client";

import { useState } from "react";
import { store } from "@/lib/store";

export default function DataBackup() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const exportData = () => {
    const blob = new Blob([store.exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sugar-saathi-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg({ ok: true, text: "Backup downloaded." });
  };

  const importData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) return setMsg({ ok: false, text: "That file is too large." });
    if (!window.confirm("Restoring replaces everything currently in this browser with the backup. Continue?")) return;
    const result = store.importJson(await file.text());
    if (!result) return setMsg({ ok: false, text: "That doesn't look like a Sugar Saathi backup file." });
    setMsg(result.saved ? { ok: true, text: `Restored ${result.meals} meals and ${result.readings} readings.` } : { ok: false, text: "Your browser couldn't save that much data." });
  };

  const clear = () => {
    if (window.confirm("Delete ALL meals, readings and settings from this browser? This can't be undone. Export a backup first if unsure.")) {
      store.clearAll();
      setMsg({ ok: true, text: "All data deleted from this browser." });
    }
  };

  return (
    <div className="space-y-3 text-sm">
      <p className="text-zinc-600">There are no accounts: your meals, readings and goals are stored only in this browser on this device. Clearing browser data or switching device loses them, so export a backup now and then.</p>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={exportData} className="rounded-lg border border-zinc-300 px-4 py-2">Export backup</button>
        <label className="cursor-pointer rounded-lg border border-zinc-300 px-4 py-2">
          Restore from backup
          <input type="file" accept="application/json,.json" className="hidden" onChange={importData} />
        </label>
        <button type="button" onClick={clear} className="rounded-lg border border-red-300 px-4 py-2 text-red-700">Delete all my data</button>
      </div>
      {msg && <p role="alert" className={msg.ok ? "text-emerald-800" : "text-red-700"}>{msg.text}</p>}
    </div>
  );
}
