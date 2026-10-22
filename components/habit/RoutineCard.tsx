"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { dayKey } from "@/lib/day";
import { store, useStore } from "@/lib/store";
import { nowMs } from "@/lib/time";

export default function RoutineCard() {
  const { routine, ticks } = useStore();
  const today = dayKey(new Date(nowMs()));
  const done = ticks[today] ?? [];
  if (routine.length === 0) {
    return (
      <Card tone="sand">
        <h2 className="font-display text-xl font-semibold">Today&apos;s routine</h2>
        <p className="mt-1 text-sm text-muted">Add small daily habits you want to keep, like a walk, water or a morning check.</p>
        <Link href="/app/routine" className="mt-2 inline-block text-sm font-medium text-moss underline">Set up my routine</Link>
      </Card>
    );
  }
  const count = routine.filter((r) => done.includes(r.id)).length;
  return (
    <Card>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">Today&apos;s routine</h2>
        <span className="tabular text-sm text-muted">{count} of {routine.length}</span>
      </div>
      <ul className="mt-3 space-y-2">
        {routine.map((r) => {
          const on = done.includes(r.id);
          return (
            <li key={r.id}>
              <button type="button" role="checkbox" aria-checked={on} onClick={() => store.toggleTick(today, r.id)} className={`flex min-h-12 w-full items-center gap-3 rounded-2xl border px-4 text-left transition ${on ? "border-moss bg-moss-soft" : "border-line bg-cream hover:bg-sand"}`}>
                <span className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-sm ${on ? "border-moss bg-moss text-white" : "border-line bg-paper"}`} aria-hidden="true">{on ? "✓" : ""}</span>
                <span aria-hidden="true">{r.icon}</span>
                <span className={on ? "text-muted line-through" : ""}>{r.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <Link href="/app/routine" className="mt-3 inline-block text-sm font-medium text-moss underline">Edit routine and reminders</Link>
    </Card>
  );
}
