"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmCard from "./ConfirmCard";
import TipsCard from "./TipsCard";
import { UpgradeButton } from "./Upgrade";
import { createClient } from "@/lib/supabase/browser";
import { nutritionOf, totalCarbs } from "@/lib/carbs";
import { mealTips, type MealTips } from "@/lib/insights";
import { parseReading } from "@/lib/glucose";
import type { Food, Item, MealType, ParseResponse, Profile } from "@/lib/types";

const MAX_TEXT = 300;

function nowLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function guessType(): MealType {
  const h = new Date().getHours();
  if (h < 11) return "breakfast";
  if (h < 16) return "lunch";
  if (h < 19) return "snack";
  return "dinner";
}

export default function LogMeal({ profile, usedToday }: { profile: Pick<Profile, "plan" | "meal_carb_target">; usedToday: number }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitHit, setLimitHit] = useState(false);
  const [draft, setDraft] = useState<{ text: string; items: Item[]; foods: Food[] } | null>(null);
  const [mealType, setMealType] = useState<MealType>(guessType());
  const [eatenAt, setEatenAt] = useState(nowLocal());
  const [pre, setPre] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<{ tips: MealTips; carbs: number } | null>(null);
  const [used, setUsed] = useState(usedToday);

  const FREE_LIMIT = 3;
  const isPro = profile.plan === "pro";

  const estimate = async () => {
    if (text.trim() === "") return setError("Type what you ate.");
    if (text.length > MAX_TEXT) return setError("Please keep it to one meal (under 300 characters).");
    setLoading(true);
    setError(null);
    setLimitHit(false);
    setDraft(null);
    setSaved(null);
    try {
      const res = await fetch("/api/parse-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json().catch(() => null);
      if (res.status === 429) setLimitHit(true);
      if (!res.ok || !data) return setError(data?.error ?? "Couldn't reach the AI, try again.");
      const parsed = data as ParseResponse;
      if (parsed.usage) setUsed(parsed.usage.used);
      if (parsed.items.length === 0) return setError("I couldn't find any food in that. Try e.g. 2 rotis, 1 katori dal.");
      // Items the AI is unsure about go first so they get noticed.
      const items = parsed.items
        .map((i) => ({ ...i, key: crypto.randomUUID() }))
        .sort((a, b) => Number(a.confidence >= 0.7 && a.foodId !== null) - Number(b.confidence >= 0.7 && b.foodId !== null));
      setDraft({ text, items, foods: parsed.foods });
    } catch {
      setError("Couldn't reach the AI, try again.");
    } finally {
      setLoading(false);
    }
  };

  const confirm = async () => {
    if (!draft) return;
    setSaveError(null);
    const when = new Date(eatenAt);
    if (Number.isNaN(when.getTime())) return setSaveError("Pick a valid date and time.");
    if (when.getTime() > Date.now() + 5 * 60_000) return setSaveError("That time is in the future.");
    let preValue: number | null = null;
    if (pre.trim() !== "") {
      const p = parseReading(pre);
      if (!p.ok) return setSaveError(`Before-meal reading: ${p.message}`);
      preValue = p.value;
    }

    const lines = draft.items.filter((i) => i.foodId !== null).map((i) => ({ foodId: i.foodId as string, count: i.count, typed: i.typed }));
    const n = nutritionOf(lines, draft.foods);
    setSaving(true);
    const supabase = createClient();
    const { error: err } = await supabase.from("meals").insert({
      eaten_at: when.toISOString(),
      meal_type: mealType,
      text: draft.text,
      items: lines,
      carbs: n.carbs,
      fibre: n.fibre,
      protein: n.protein,
      gl: n.gl,
    });
    if (err) {
      setSaving(false);
      return setSaveError("Couldn't save the meal. Try again.");
    }
    if (preValue !== null) {
      await supabase.from("readings").insert({ value: preValue, measured_at: when.toISOString(), source: "manual" });
    }
    setSaving(false);
    setSaved({ tips: mealTips(lines, draft.foods, profile), carbs: n.carbs });
    setDraft(null);
    setText("");
    setPre("");
    setEatenAt(nowLocal());
    router.refresh();
  };

  const input = "rounded border border-zinc-300 px-2 py-1";

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <label htmlFor="meal" className="mb-1 block font-medium">What did you eat?</label>
        <textarea id="meal" rows={2} className="w-full rounded border border-zinc-300 p-2" placeholder="e.g. 2 rotis, 1 katori dal, aloo sabzi" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button type="button" disabled={loading || text.trim() === ""} className="rounded-lg bg-emerald-700 px-4 py-2 text-white disabled:opacity-40" onClick={estimate}>
            {loading ? "Working…" : "Estimate carbs"}
          </button>
          {!isPro && <span className="text-sm text-zinc-500">{Math.min(used, FREE_LIMIT)} of {FREE_LIMIT} free AI logs used today</span>}
          {text.trim() === "" && !loading && <span className="text-sm text-zinc-500">Type what you ate.</span>}
        </div>
        {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
        {limitHit && <div className="mt-2"><UpgradeButton label="Upgrade for unlimited logs" /></div>}
      </section>

      {draft && (
        <>
          <ConfirmCard
            text={draft.text}
            items={draft.items}
            foods={draft.foods}
            onChange={(items) => setDraft({ ...draft, items })}
            onConfirm={confirm}
            onCancel={() => setDraft(null)}
            confirmLabel={saving ? "Saving…" : "Confirm and save"}
            confirmDisabled={saving}
          />
          <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="font-semibold">Details to save with it</h2>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
              <label>Meal <select className={input} value={mealType} onChange={(e) => setMealType(e.target.value as MealType)}>
                {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map((t) => <option key={t} value={t}>{t}</option>)}
              </select></label>
              <label>When <input type="datetime-local" className={input} value={eatenAt} onChange={(e) => setEatenAt(e.target.value)} /></label>
              <label>Glucose just before (optional) <input inputMode="numeric" placeholder="mg/dL" className={`${input} w-24`} value={pre} onChange={(e) => setPre(e.target.value)} /></label>
            </div>
            {saveError && <p role="alert" className="mt-2 text-sm text-red-700">{saveError}</p>}
            <p className="mt-2 text-xs text-zinc-500">Total about {totalCarbs(draft.items, draft.foods).grams} g carbs will be saved. Add your 2-hour reading later from History or Glucose.</p>
          </section>
        </>
      )}

      {saved && (
        <section className="rounded-xl border border-emerald-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Saved. Here&apos;s how this meal looks</h2>
          <TipsCard tips={saved.tips} />
        </section>
      )}
    </div>
  );
}
