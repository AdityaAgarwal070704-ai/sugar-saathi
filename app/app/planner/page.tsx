"use client";

import Planner from "@/components/Planner";
import { useStore } from "@/lib/store";

export default function PlannerPage() {
  const { ready, profile } = useStore();
  if (!ready) return <p className="text-zinc-500">Loading…</p>;
  return (
    <>
      <h1 className="text-2xl font-bold">Meal planner</h1>
      <Planner defaultTarget={profile.meal_carb_target} defaultDiet={profile.diet} />
    </>
  );
}
