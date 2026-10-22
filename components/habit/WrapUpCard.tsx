"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { store } from "@/lib/store";
import { useT } from "@/lib/useT";
import type { WrapUp } from "@/lib/wrapup";

export default function WrapUpCard({ wrap, day }: { wrap: WrapUp; day: string }) {
  const { t } = useT();
  return (
    <Card tone="sand">
      <h2 className="font-display text-xl font-semibold">{t("wrap.title")}</h2>
      <ul className="mt-2 space-y-1 text-sm">
        {wrap.lines.map((l) => <li key={l}>{l}</li>)}
      </ul>
      {wrap.good && <p className="mt-3 rounded-2xl bg-moss-soft px-3 py-2 text-sm"><strong>{t("wrap.went")}</strong> {wrap.good}</p>}
      {wrap.idea && <p className="mt-2 rounded-2xl bg-saffron-soft px-3 py-2 text-sm"><strong>{t("wrap.idea")}</strong> {wrap.idea}</p>}
      <Button variant="ghost" size="sm" className="mt-2" onClick={() => store.dismissWrapup(day)}>{t("common.dismiss")}</Button>
    </Card>
  );
}
