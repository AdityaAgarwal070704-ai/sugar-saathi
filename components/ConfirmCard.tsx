"use client";

import { itemCarbs, totalCarbs } from "@/lib/carbs";
import type { Food, Item } from "@/lib/types";

type Props = {
  text: string;
  items: Item[];
  foods: Food[];
  onChange: (items: Item[]) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmCard({ text, items, foods, onChange, onConfirm, onCancel }: Props) {
  const total = totalCarbs(items, foods);

  const update = (key: string, patch: Partial<Item>) =>
    onChange(items.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  const remove = (key: string) => onChange(items.filter((i) => i.key !== key));
  const add = (foodId: string) =>
    onChange([
      ...items,
      { key: crypto.randomUUID(), typed: "added by you", foodId, count: 1, confidence: 1 },
    ]);

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Check your meal</h2>
      <p className="mb-3 text-sm text-zinc-600">You typed: &ldquo;{text}&rdquo;</p>

      <ul className="space-y-3">
        {items.map((item) => {
          const food = foods.find((f) => f.id === item.foodId);
          const carbs = itemCarbs(item, foods);
          const unknown = item.foodId === null;
          const unsure = !unknown && item.confidence < 0.7;
          return (
            <li
              key={item.key}
              className={`rounded-lg border p-3 ${
                unknown ? "border-red-300 bg-red-50" : unsure ? "border-amber-300 bg-amber-50" : "border-zinc-200"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-zinc-500">You said &ldquo;{item.typed}&rdquo; →</span>
                <select
                  aria-label={`Dish for ${item.typed}`}
                  className="rounded border border-zinc-300 bg-white px-2 py-1 text-sm"
                  value={item.foodId ?? ""}
                  onChange={(e) => update(item.key, { foodId: e.target.value || null, confidence: 1 })}
                >
                  <option value="">Not in my table</option>
                  {foods.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
                {unsure && (
                  <span className="rounded bg-amber-200 px-2 py-0.5 text-xs font-medium text-amber-900">
                    Check this
                  </span>
                )}
              </div>

              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Less"
                  className="h-8 w-8 rounded border border-zinc-300 text-lg"
                  onClick={() => update(item.key, { count: Math.max(0.5, item.count - 0.5) })}
                >
                  −
                </button>
                <span className="min-w-24 text-center text-sm">
                  {item.count} {food ? `${food.unit}${item.count === 1 ? "" : "s"}` : ""}
                </span>
                <button
                  type="button"
                  aria-label="More"
                  className="h-8 w-8 rounded border border-zinc-300 text-lg"
                  onClick={() => update(item.key, { count: item.count + 0.5 })}
                >
                  +
                </button>
                <span className="ml-auto text-sm font-medium">
                  {carbs === null ? (
                    <span className="text-red-700">Not in my table, not counted</span>
                  ) : (
                    `${carbs} g carbs`
                  )}
                </span>
                <button
                  type="button"
                  className="text-sm text-zinc-500 underline"
                  onClick={() => remove(item.key)}
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-3">
        <select
          aria-label="Add an item"
          className="rounded border border-zinc-300 bg-white px-2 py-1 text-sm"
          value=""
          onChange={(e) => e.target.value && add(e.target.value)}
        >
          <option value="">+ Add an item I missed…</option>
          {foods.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 border-t border-zinc-200 pt-3">
        {total.counted === 0 ? (
          <>
            <p className="text-xl font-semibold">No carbs to count yet</p>
            <p className="text-sm text-zinc-600">
              None of these foods are in my table. Pick the closest dish from a list above, add one below, or start over.
            </p>
          </>
        ) : (
          <>
            <p className="text-xl font-semibold">
              {total.skipped > 0 ? "Partial total: " : "Total: "}
              about {total.grams} g carbs
            </p>
            <p className="text-sm text-zinc-600">
              Covers {total.counted} of {items.length} items
              {total.skipped > 0 ? ` (${total.skipped} not counted)` : ""}. Estimate from a starter table, not verified.
            </p>
          </>
        )}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={total.counted === 0}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-white disabled:opacity-40"
            onClick={onConfirm}
          >
            Confirm meal
          </button>
          <button type="button" className="rounded-lg border border-zinc-300 px-4 py-2" onClick={onCancel}>
            Start over
          </button>
        </div>
      </div>
    </section>
  );
}
