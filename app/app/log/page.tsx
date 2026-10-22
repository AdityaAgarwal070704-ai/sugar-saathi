"use client";

import LogMeal from "@/components/LogMeal";
import { useStore } from "@/lib/store";

export default function LogPage() {
  const { profile } = useStore();
  return (
    <>
      <h1 className="text-2xl font-bold">Log a meal</h1>
      <LogMeal profile={profile} />
    </>
  );
}
