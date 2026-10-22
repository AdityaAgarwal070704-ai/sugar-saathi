"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { store } from "@/lib/store";
import type { WrapUp } from "@/lib/wrapup";

export default function WrapUpCard({ wrap, day }: { wrap: WrapUp; day: string }) {
  return (
    <Card tone="sand">
      <h2 className="font-display text-xl font-semibold">🌙 Your day in a minute</h2>
      <ul className="mt-2 space-y-1 text-sm">
        {wrap.lines.map((l) => <li key={l}>{l}</li>)}
      </ul>
      {wrap.good && <p className="mt-3 rounded-2xl bg-moss-soft px-3 py-2 text-sm"><strong>Went well:</strong> {wrap.good}</p>}
      {wrap.idea && <p className="mt-2 rounded-2xl bg-saffron-soft px-3 py-2 text-sm"><strong>Idea for tomorrow:</strong> {wrap.idea}</p>}
      <Button variant="ghost" size="sm" className="mt-2" onClick={() => store.dismissWrapup(day)}>Dismiss</Button>
    </Card>
  );
}
