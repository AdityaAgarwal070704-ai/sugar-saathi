"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Checkin } from "@/lib/checkin";
import { shareText } from "@/lib/share";
import { store } from "@/lib/store";

export default function CheckinCard({ checkin, text }: { checkin: Checkin; text: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  const share = async () => {
    const r = await shareText(text);
    setMsg(r === "shared" ? "Shared." : r === "opened" ? "WhatsApp opened with your summary." : r === "copied" ? "Summary copied." : null);
  };
  return (
    <Card tone="moss">
      <h2 className="font-display text-2xl font-semibold">Your weekly check-in</h2>
      <ul className="mt-3 space-y-1.5 text-white/90">
        {checkin.highlights.map((h) => <li key={h}>• {h}</li>)}
      </ul>
      <div className="mt-4 rounded-2xl bg-white/12 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-saffron">One thing to try this week</p>
        <p className="mt-1">{checkin.tryThis}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="saffron" onClick={share}>Share on WhatsApp</Button>
        <Button variant="outline" onClick={() => store.markCheckin()}>Done for this week</Button>
      </div>
      {msg && <p className="mt-2 text-sm text-white/80">{msg}</p>}
      <p className="mt-3 text-xs text-white/60">Possible links to discuss with your educator, not medical advice.</p>
    </Card>
  );
}
