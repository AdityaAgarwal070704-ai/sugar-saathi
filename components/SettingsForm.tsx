"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { store } from "@/lib/store";
import type { Profile } from "@/lib/types";

export default function SettingsForm({ profile }: { profile: Profile }) {
  const [name, setName] = useState(profile.display_name ?? "");
  const [carbs, setCarbs] = useState(String(profile.meal_carb_target));
  const [low, setLow] = useState(String(profile.glucose_low));
  const [high, setHigh] = useState(String(profile.glucose_high));
  const [diet, setDiet] = useState(profile.diet);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const c = Number(carbs), l = Number(low), h = Number(high);
    if (!Number.isInteger(c) || c < 10 || c > 200) return setMsg({ ok: false, text: "Carb goal must be a whole number from 10 to 200 g." });
    if (!Number.isInteger(l) || l < 40 || l > 120) return setMsg({ ok: false, text: "Low limit must be from 40 to 120 mg/dL." });
    if (!Number.isInteger(h) || h < 100 || h > 300 || h <= l) return setMsg({ ok: false, text: "High limit must be from 100 to 300 mg/dL and above the low limit." });
    const ok = store.setProfile({ display_name: name.trim() || null, meal_carb_target: c, glucose_low: l, glucose_high: h, diet });
    setMsg(ok ? { ok: true, text: "Saved." } : { ok: false, text: "Your browser couldn't save this (storage blocked)." });
  };

  const input = "min-h-11 rounded-xl border border-line bg-cream px-3";
  return (
    <form onSubmit={save} className="space-y-4">
      <label className="block">Name <input className={`${input} ml-2`} value={name} maxLength={40} onChange={(e) => setName(e.target.value)} /></label>
      <label className="block">Carb goal per meal (g) <input inputMode="numeric" className={`${input} ml-2 w-20`} value={carbs} onChange={(e) => setCarbs(e.target.value)} /></label>
      <div className="flex flex-wrap gap-4">
        <label>Glucose range low <input inputMode="numeric" className={`${input} ml-2 w-20`} value={low} onChange={(e) => setLow(e.target.value)} /> mg/dL</label>
        <label>high <input inputMode="numeric" className={`${input} ml-2 w-20`} value={high} onChange={(e) => setHigh(e.target.value)} /> mg/dL</label>
      </div>
      <label className="block">Diet <select className={`${input} ml-2`} value={diet} onChange={(e) => setDiet(e.target.value as typeof diet)}>
        <option value="veg">Vegetarian</option><option value="egg">Vegetarian + egg</option><option value="nonveg">Non-vegetarian</option>
      </select></label>
      <p className="text-xs text-muted">Ask your doctor or educator what goals suit you. These only change how the app labels your data.</p>
      <Button type="submit">Save settings</Button>
      {msg && <span role="alert" className={`ml-3 ${msg.ok ? "text-leaf" : "text-terracotta"}`}>{msg.text}</span>}
    </form>
  );
}
