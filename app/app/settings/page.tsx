"use client";

import DataBackup from "@/components/DataBackup";
import SettingsForm from "@/components/SettingsForm";
import { useStore } from "@/lib/store";

export default function SettingsPage() {
  const { ready, profile } = useStore();
  if (!ready) return <p className="text-zinc-500">Loading…</p>;
  return (
    <>
      <h1 className="text-2xl font-bold">Settings</h1>
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="mb-2 font-semibold">Your goals</h2>
        <SettingsForm profile={profile} />
      </section>
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="mb-2 font-semibold">Your data</h2>
        <DataBackup />
      </section>
    </>
  );
}
