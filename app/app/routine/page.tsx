"use client";

import Link from "next/link";
import RoutineManager from "@/components/habit/RoutineManager";
import { useStore } from "@/lib/store";

export default function RoutinePage() {
  const { ready } = useStore();
  if (!ready) return <p className="text-muted">Loading…</p>;
  return (
    <>
      <div>
        <Link href="/app/me" className="inline-block py-2 text-sm font-medium text-moss underline">← Me</Link>
        <h1 className="mt-2 font-display text-3xl font-semibold">Routine and reminders</h1>
        <p className="mt-1 text-muted">Build a daily rhythm you can keep.</p>
      </div>
      <RoutineManager />
    </>
  );
}
