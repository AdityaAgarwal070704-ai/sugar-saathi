"use client";

import Link from "next/link";
import Planner from "@/components/Planner";
import { useStore } from "@/lib/store";

export default function PlannerPage() {
  const { ready, profile } = useStore();
  if (!ready) return <p className="text-muted">Loading…</p>;
  return (
    <>
      <div>
        <Link href="/app/discover" className="inline-block py-2 text-sm font-medium text-moss underline">← Discover</Link>
        <h1 className="mt-2 font-display text-3xl font-semibold">Day meal planner</h1>
        <p className="mt-1 text-muted">Ideas for a full day of Indian meals that fit your carb goal.</p>
      </div>
      <Planner defaultTarget={profile.meal_carb_target} defaultDiet={profile.diet} />
    </>
  );
}
