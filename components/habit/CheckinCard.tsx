"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Checkin } from "@/lib/checkin";
import { shareText } from "@/lib/share";
import { store } from "@/lib/store";
import { useT } from "@/lib/useT";

export default function CheckinCard({ checkin, text }: { checkin: Checkin; text: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  const { t } = useT();
  const share = async () => {
    const r = await shareText(text);
    setMsg(r === "shared" ? t("checkin.shared") : r === "opened" ? t("checkin.opened") : r === "copied" ? t("checkin.copied") : null);
  };
  return (
    <Card tone="moss">
      <h2 className="font-display text-2xl font-semibold">{t("checkin.title")}</h2>
      <ul className="mt-3 space-y-1.5 text-white/90">
        {checkin.highlights.map((h) => <li key={h}>• {h}</li>)}
      </ul>
      <div className="mt-4 rounded-2xl bg-white/12 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#f2b95c]">{t("checkin.try")}</p>
        <p className="mt-1">{checkin.tryThis}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="saffron" onClick={share}>{t("checkin.share")}</Button>
        <Button variant="outline" onClick={() => store.markCheckin()}>{t("checkin.done")}</Button>
      </div>
      {msg && <p className="mt-2 text-sm text-white/80">{msg}</p>}
      <p className="mt-3 text-xs text-white/60">{t("checkin.note")}</p>
    </Card>
  );
}
