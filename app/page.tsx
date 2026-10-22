"use client";

import { useState } from "react";
import ConfirmCard from "@/components/ConfirmCard";
import Timeline from "@/components/Timeline";
import { totalCarbs } from "@/lib/carbs";
import type { Food, Item, Meal, ParseResponse } from "@/lib/types";

const MAX_TEXT = 300;

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ text: string; items: Item[]; foods: Food[] } | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);

  const estimate = async () => {
    if (text.trim() === "") {
      setError("Type what you ate.");
      return;
    }
    if (text.length > MAX_TEXT) {
      setError("Please keep it to one meal (under 300 characters).");
      return;
    }
    setLoading(true);
    setError(null);
    setDraft(null);
    try {
      const res = await fetch("/api/parse-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        setError(data?.error ?? "Couldn't reach the AI, try again.");
        return;
      }
      const parsed = data as ParseResponse;
      if (parsed.items.length === 0) {
        setError("I couldn't find any food in that. Try e.g. 2 rotis, 1 katori dal.");
        return;
      }
      // Items Claude is unsure about go first so they get noticed.
      const items = parsed.items
        .map((i) => ({ ...i, key: crypto.randomUUID() }))
        .sort((a, b) => Number(a.confidence >= 0.7 && a.foodId) - Number(b.confidence >= 0.7 && b.foodId));
      setDraft({ text, items, foods: parsed.foods });
    } catch {
      setError("Couldn't reach the AI, try again.");
    } finally {
      setLoading(false);
    }
  };

  const confirm = () => {
    if (!draft) return;
    const total = totalCarbs(draft.items, draft.foods);
    setMeals((m) => [
      {
        id: crypto.randomUUID(),
        text: draft.text,
        carbs: total.grams,
        partial: total.skipped > 0,
        pre: null,
        post: null,
      },
      ...m,
    ]);
    setDraft(null);
    setText("");
  };

  const saveReadings = (id: string, pre: number | null, post: number | null) =>
    setMeals((m) => m.map((x) => (x.id === id ? { ...x, pre, post } : x)));

  return (
    <main className="mx-auto w-full max-w-2xl space-y-4 p-4 sm:py-8">
      <header>
        <h1 className="text-2xl font-bold">Sugar Saathi</h1>
        <p className="text-sm text-zinc-600">Describe a meal, check the carbs, and see it beside your glucose.</p>
      </header>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <label htmlFor="meal" className="mb-1 block font-medium">
          What did you eat?
        </label>
        <textarea
          id="meal"
          rows={2}
          className="w-full rounded border border-zinc-300 p-2"
          placeholder="e.g. 2 rotis, 1 katori dal, aloo sabzi"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            disabled={loading || text.trim() === ""}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-white disabled:opacity-40"
            onClick={estimate}
          >
            {loading ? "Working…" : "Estimate carbs"}
          </button>
          {text.trim() === "" && !loading && <span className="text-sm text-zinc-500">Type what you ate.</span>}
        </div>
        {error && (
          <p role="alert" className="mt-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </section>

      {draft && (
        <ConfirmCard
          text={draft.text}
          items={draft.items}
          foods={draft.foods}
          onChange={(items) => setDraft({ ...draft, items })}
          onConfirm={confirm}
          onCancel={() => setDraft(null)}
        />
      )}

      <Timeline meals={meals} onSave={saveReadings} />
    </main>
  );
}
