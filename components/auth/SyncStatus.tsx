"use client";

import { Button } from "@/components/ui/Button";
import { syncNow, useSyncState } from "@/lib/sync";
import { useAuth } from "./AuthProvider";

// Shows whether this device is in step with the cloud copy (Me screen).
export default function SyncStatus() {
  const { status, can } = useAuth();
  const sync = useSyncState();
  if (status !== "signedIn") return null;

  let line: string;
  if (!can("sync")) line = "Cloud sync is part of Pro, so your data stays on this device only. If you had a cloud copy before, it is kept and not changed.";
  else if (sync.phase === "syncing" || sync.phase === "idle") line = "Syncing with your cloud copy…";
  else if (sync.phase === "synced") line = `Backed up and in step across your devices. Last synced ${sync.at ? new Date(sync.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "just now"}.`;
  else if (sync.phase === "error") line = sync.message ?? "Sync hit a problem. Your data on this device is safe.";
  else line = sync.message ?? "Cloud sync isn't switched on for this site yet. Your data stays on this device.";

  return (
    <div className="mt-4 rounded-2xl bg-sand p-3 text-sm">
      <p className="font-medium">Cloud sync</p>
      <p role="status" className={sync.phase === "error" ? "mt-1 text-terracotta" : "mt-1 text-muted"}>{line}</p>
      {can("sync") && (sync.phase === "error" || sync.phase === "synced") && (
        <Button size="sm" variant="outline" className="mt-2" onClick={() => void syncNow()}>Sync now</Button>
      )}
    </div>
  );
}
