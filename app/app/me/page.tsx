"use client";

import Link from "next/link";
import DataBackup from "@/components/DataBackup";
import SettingsForm from "@/components/SettingsForm";
import { Card } from "@/components/ui/Card";
import { useStore } from "@/lib/store";

export default function MePage() {
  const { ready, profile } = useStore();
  if (!ready) return <p className="text-muted">Loading…</p>;
  return (
    <>
      <h1 className="font-display text-3xl font-semibold">Me</h1>
      <Link href="/app/routine" className="block rounded-3xl border border-line bg-paper p-5 shadow-soft transition hover:shadow-lift">
        <h2 className="font-display text-xl font-semibold">⏰ Routine and reminders</h2>
        <p className="mt-1 text-sm text-muted">Daily habits to tick off, a walk timer, and phone calendar reminders for meals and 2-hour checks.</p>
      </Link>
      <Card>
        <h2 className="mb-3 font-display text-xl font-semibold">Your goals</h2>
        <SettingsForm profile={profile} />
      </Card>
      <Card>
        <h2 className="mb-3 font-display text-xl font-semibold">Your data</h2>
        <DataBackup />
      </Card>
    </>
  );
}
