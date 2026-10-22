"use client";

import Link from "next/link";
import GlucoseQuickAdd from "@/components/GlucoseQuickAdd";
import TipsCard from "@/components/TipsCard";
import { FOODS } from "@/lib/foods-client";
import { mealTips } from "@/lib/insights";
import { nowMs } from "@/lib/time";
import { useRecent } from "@/lib/useRecent";
import DeleteMeal from "./DeleteMeal";

function localInput(ms: number) {
  const d = new Date(ms);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function History() {
  const { ready, paired, profile } = useRecent(365);
  if (!ready) return <p className="text-zinc-500">Loading…</p>;

  return (
    <>
      <h1 className="text-2xl font-bold">History</h1>
      {paired.length === 0 && <p className="text-zinc-600">No meals yet. <Link href="/app/log" className="underline">Log your first meal</Link>.</p>}
      <ul className="space-y-3">
        {paired.map((m) => {
          const age = nowMs() - new Date(m.eaten_at).getTime();
          const tips = mealTips(m.items, FOODS, profile);
          return (
            <li key={m.id} className="rounded-xl border border-zinc-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{m.text}</p>
                  <p className="text-xs text-zinc-500">{new Date(m.eaten_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} · {m.meal_type}</p>
                </div>
                <DeleteMeal id={m.id} />
              </div>
              <p className="mt-1 text-sm">About <strong>{m.carbs} g</strong> carbs · fibre {m.fibre} g · protein {m.protein} g · glycemic load {m.gl}</p>
              <p className="mt-1 text-sm">
                Before: {m.pre ? `${m.pre.value} mg/dL` : "–"} · 2 h after: {m.post ? `${m.post.value} mg/dL` : "–"} ·{" "}
                {m.rise !== null ? <strong>Rise: {m.rise > 0 ? "+" : ""}{m.rise} mg/dL</strong> : <span className="text-zinc-500">rise appears with both readings</span>}
              </p>
              {m.post === null && age >= 60 * 60_000 && (
                <div className="mt-2 text-sm">
                  <p className="mb-1 text-zinc-600">Add the 2-hour reading for this meal:</p>
                  <GlucoseQuickAdd defaultTime={localInput(new Date(m.eaten_at).getTime() + 120 * 60_000)} />
                </div>
              )}
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-emerald-800">Tips for this meal</summary>
                <div className="mt-2"><TipsCard tips={tips} /></div>
              </details>
            </li>
          );
        })}
      </ul>
    </>
  );
}
