"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { store, useStore } from "@/lib/store";
import { useAuth } from "./AuthProvider";

// One-time offer: data saved on this device before accounts existed can be moved into the account that just signed in.
export default function LegacyDataPrompt() {
  const { user, status } = useAuth();
  const { ready } = useStore();
  const [answered, setAnswered] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const offer = !answered && status === "signedIn" && Boolean(user) && ready && store.hasLegacyData(user!.id);
  if (!offer || !user) return msg ? <p className="mx-auto max-w-5xl px-4 pt-3 text-sm text-leaf">{msg}</p> : null;
  return (
    <div className="mx-auto max-w-5xl px-4 pt-3 md:px-6 print:hidden">
      <Card tone="saffron" role="region" aria-label="Existing data found">
        <h2 className="font-display text-lg font-semibold">We found meals and readings already saved on this device</h2>
        <p className="mt-1 text-sm">Do you want to use them in this account? They stay on this device, and only this account will see them.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => { const ok = store.adoptLegacy(user.id); setAnswered(true); setMsg(ok ? "Done. Your earlier data is now in this account." : "We couldn't move your data. Export a backup from Me and restore it."); }}>Use my existing data</Button>
          <Button size="sm" variant="outline" onClick={() => { store.dismissLegacy(user.id); setAnswered(true); }}>Start fresh</Button>
        </div>
      </Card>
    </div>
  );
}
