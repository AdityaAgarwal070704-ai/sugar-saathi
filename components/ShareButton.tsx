"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { shareText } from "@/lib/share";

export default function ShareButton({ text, label = "Share on WhatsApp" }: { text: string; label?: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <span className="inline-flex flex-col items-start gap-1 print:hidden">
      <Button variant="saffron" onClick={async () => {
        const r = await shareText(text);
        setMsg(r === "shared" ? "Shared." : r === "opened" ? "WhatsApp opened with your summary ready to send." : r === "copied" ? "Summary copied to your clipboard." : null);
      }}>{label}</Button>
      {msg && <span className="text-xs text-muted" role="status">{msg}</span>}
    </span>
  );
}
