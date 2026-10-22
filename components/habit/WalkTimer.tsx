"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { store, useStore } from "@/lib/store";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// A 10-minute walk timer. The start time is saved, so it keeps counting if you switch screens.
export default function WalkTimer({ offer }: { offer: boolean }) {
  const { timer } = useStore();
  const [now, setNow] = useState(() => Date.now());
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    if (!timer) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [timer]);

  const total = timer ? timer.minutes * 60 : 0;
  const left = timer ? Math.max(0, Math.round(total - (now - new Date(timer.started_at).getTime()) / 1000)) : 0;
  const finished = Boolean(timer) && left === 0;

  useEffect(() => {
    if (!finished) return;
    try {
      navigator.vibrate?.([200, 100, 200]);
    } catch {
      // vibration not supported
    }
  }, [finished]);

  if (done) {
    return (
      <Card tone="moss" className="pop-in">
        <p className="font-display text-xl font-semibold">{done}</p>
        <Button variant="saffron" size="sm" className="mt-3" onClick={() => setDone(null)}>Great</Button>
      </Card>
    );
  }

  if (timer) {
    const pct = total > 0 ? ((total - left) / total) * 100 : 0;
    return (
      <Card tone="saffron" aria-live="polite">
        <p className="font-display text-xl font-semibold">{finished ? "Walk complete! 🎉" : "Walking… keep going"}</p>
        <p className="tabular my-2 font-display text-5xl font-semibold">{finished ? "0:00" : fmt(left)}</p>
        <div className="h-2.5 overflow-hidden rounded-full bg-paper" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label="Walk progress">
          <div className="h-full rounded-full bg-moss transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-3 flex gap-2">
          {finished ? (
            <Button onClick={() => { store.finishTimer(); setDone(`Nice! ${timer.minutes} minutes logged.`); }}>Log my walk</Button>
          ) : (
            <>
              <Button variant="soft" size="sm" onClick={() => { store.finishTimer(); setDone("Walk logged. Every bit counts."); }}>I&apos;m done early</Button>
              <Button variant="ghost" size="sm" onClick={() => store.cancelTimer()}>Cancel</Button>
            </>
          )}
        </div>
      </Card>
    );
  }

  if (!offer) return null;
  return (
    <Card tone="sand" className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="font-display text-lg font-semibold">🚶 Take a 10-minute walk?</p>
        <p className="text-sm text-muted">A short walk after eating is a habit many people find helpful. Ask your doctor what suits you.</p>
      </div>
      <Button onClick={() => store.startTimer(10)}>Start timer</Button>
    </Card>
  );
}
