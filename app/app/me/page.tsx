"use client";

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
