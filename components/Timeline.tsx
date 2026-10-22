"use client";

import { useState } from "react";
import { parseReading, rise } from "@/lib/glucose";
import type { Meal } from "@/lib/types";

function MealRow({ meal, onSave }: { meal: Meal; onSave: (id: string, pre: number | null, post: number | null) => void }) {
  const [pre, setPre] = useState(meal.pre?.toString() ?? "");
  const [post, setPost] = useState(meal.post?.toString() ?? "");
  const [errors, setErrors] = useState<{ pre?: string; post?: string }>({});
  const r = rise(meal.pre, meal.post);

  const save = () => {
    const next: { pre?: string; post?: string } = {};
    let preVal = meal.pre;
    let postVal = meal.post;
    if (pre.trim() !== "") {
      const p = parseReading(pre);
      if (p.ok) preVal = p.value;
      else next.pre = p.message;
    }
    if (post.trim() !== "") {
      const p = parseReading(post);
      if (p.ok) postVal = p.value;
      else next.post = p.message;
    }
    if (pre.trim() === "" && post.trim() === "") {
      next.pre = "Enter at least one reading.";
    }
    setErrors(next);
    // Put any rejected field back to its saved value so the box never disagrees with the line below it.
    if (next.pre) setPre(meal.pre?.toString() ?? "");
    if (next.post) setPost(meal.post?.toString() ?? "");
    if (!next.pre && !next.post) onSave(meal.id, preVal, postVal);
  };

  const input = "w-24 rounded border border-zinc-300 px-2 py-1 text-sm";

  return (
    <li className="rounded-lg border border-zinc-200 p-3">
      <p className="font-medium">{meal.text}</p>
      <p className="text-sm text-zinc-600">
        About {meal.carbs} g carbs{meal.partial ? " (partial, some items not counted)" : ""}
      </p>

      <div className="mt-2 flex flex-wrap items-start gap-3">
        <label className="text-sm">
          Before meal
          <input
            inputMode="numeric"
            className={`${input} ml-2`}
            placeholder="mg/dL"
            value={pre}
            onChange={(e) => setPre(e.target.value)}
          />
          {errors.pre && <span className="block text-xs text-red-700">{errors.pre}</span>}
        </label>
        <label className="text-sm">
          2 hours after
          <input
            inputMode="numeric"
            className={`${input} ml-2`}
            placeholder="mg/dL"
            value={post}
            onChange={(e) => setPost(e.target.value)}
          />
          {errors.post && <span className="block text-xs text-red-700">{errors.post}</span>}
        </label>
        <button type="button" className="rounded border border-zinc-300 px-3 py-1 text-sm" onClick={save}>
          Save readings
        </button>
      </div>

      <p className="mt-2 text-sm">
        {meal.pre !== null && <span>Before: {meal.pre} mg/dL · </span>}
        {meal.post !== null && <span>2 h after: {meal.post} mg/dL · </span>}
        {r !== null ? (
          <strong>
            Rise: {r > 0 ? "+" : ""}
            {r} mg/dL
          </strong>
        ) : (
          <span className="text-zinc-500">Rise appears once both readings are saved.</span>
        )}
      </p>
    </li>
  );
}

export default function Timeline({
  meals,
  onSave,
}: {
  meals: Meal[];
  onSave: (id: string, pre: number | null, post: number | null) => void;
}) {
  if (meals.length === 0) return null;
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">Timeline</h2>
      <ul className="space-y-3">
        {meals.map((m) => (
          <MealRow key={`${m.id}-${m.pre}-${m.post}`} meal={m} onSave={onSave} />
        ))}
      </ul>
    </section>
  );
}
