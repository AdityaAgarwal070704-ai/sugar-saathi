"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { store } from "@/lib/store";
import { useT } from "@/lib/useT";

export default function DataBackup() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const { t } = useT();

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
    <div className="space-y-3">
      <p className="text-muted">{t("me.backupNote")}</p>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={exportData}>{t("me.export")}</Button>
        <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-line bg-paper px-5 font-medium hover:bg-sand">
          {t("me.restore")}
          <input type="file" accept="application/json,.json" className="hidden" onChange={importData} />
        </label>
        <Button variant="danger" onClick={clear}>{t("me.deleteAll")}</Button>
      </div>
      {msg && <p role="alert" className={msg.ok ? "text-leaf" : "text-terracotta"}>{msg.text}</p>}
    </div>
  );
}
