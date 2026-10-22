"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { buildIcs } from "@/lib/calendar";
import { store, useStore } from "@/lib/store";
import type { Reminders, RoutineItem } from "@/lib/types";

const SUGGESTIONS: RoutineItem[] = [
  { id: "walk", label: "10-minute walk after a meal", icon: "🚶" },
  { id: "water", label: "Drink enough water", icon: "💧" },
  { id: "fasting", label: "Check fasting sugar", icon: "🩸" },
  { id: "medicine", label: "Take medicines as prescribed", icon: "💊" },
  { id: "yoga", label: "5 minutes of stretching or yoga", icon: "🧘" },
  { id: "salad", label: "Eat a salad with lunch", icon: "🥗" },
  { id: "feet", label: "Check my feet", icon: "🦶" },
  { id: "sleep", label: "Sleep on time", icon: "🛌" },
];
const ICONS = ["⭐", "🚶", "💧", "🧘", "🥗", "🛌", "💊", "🩸", "🦶", "🌿", "☀️", "📝"];

export default function RoutineManager() {
  const { routine, reminders } = useStore();
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState("⭐");
  const [error, setError] = useState<string | null>(null);

  const addItem = (item: RoutineItem) => {
    if (routine.some((r) => r.id === item.id)) return;
    if (routine.length >= 12) return setError("You can keep up to 12 items.");
    setError(null);
    store.setRoutine([...routine, item]);
  };
  const addCustom = () => {
    const l = label.trim();
    if (l === "") return setError("Type a name for your habit.");
    if (l.length > 40) return setError("Please keep it under 40 characters.");
    addItem({ id: `c-${crypto.randomUUID().slice(0, 8)}`, label: l, icon });
    setLabel("");
  };
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= routine.length) return;
    const next = [...routine];
    [next[i], next[j]] = [next[j], next[i]];
    store.setRoutine(next);
  };

  const setR = (patch: Partial<Reminders>) => store.setReminders({ ...reminders, ...patch });
  const download = () => {
    const blob = new Blob([buildIcs(reminders, new Date())], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sugar-saathi-reminders.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  const input = "min-h-11 rounded-xl border border-line bg-cream px-3";
  return (
    <div className="space-y-5">
      <Card>
        <h2 className="font-display text-xl font-semibold">Your daily routine</h2>
        <p className="mt-1 text-sm text-muted">Small habits you tick off on the Today screen. These are your own reminders, not medical instructions. Take medicines exactly as your doctor prescribed.</p>
        <ul className="mt-3 space-y-2">
          {routine.length === 0 && <li className="text-sm text-muted">Nothing yet. Add a few below.</li>}
          {routine.map((r, i) => (
            <li key={r.id} className="flex items-center gap-2 rounded-2xl border border-line bg-cream px-3 py-2">
              <span aria-hidden="true">{r.icon}</span>
              <span className="flex-1">{r.label}</span>
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${r.label} up`} className="h-9 w-9 rounded-full hover:bg-sand disabled:opacity-30">↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === routine.length - 1} aria-label={`Move ${r.label} down`} className="h-9 w-9 rounded-full hover:bg-sand disabled:opacity-30">↓</button>
              <button type="button" onClick={() => store.setRoutine(routine.filter((x) => x.id !== r.id))} aria-label={`Remove ${r.label}`} className="h-9 w-9 rounded-full text-terracotta hover:bg-terracotta-soft">✕</button>
            </li>
          ))}
        </ul>

        <h3 className="mt-5 text-sm font-semibold">Quick add</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {SUGGESTIONS.filter((s) => !routine.some((r) => r.id === s.id)).map((s) => (
            <button key={s.id} type="button" onClick={() => addItem(s)} className="min-h-11 rounded-full border border-line bg-paper px-4 text-sm hover:bg-sand">{s.icon} {s.label}</button>
          ))}
        </div>

        <h3 className="mt-5 text-sm font-semibold">Or make your own</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select aria-label="Icon" value={icon} onChange={(e) => setIcon(e.target.value)} className={input}>{ICONS.map((i) => <option key={i}>{i}</option>)}</select>
          <input value={label} maxLength={40} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Evening stroll with family" aria-label="Habit name" className={`${input} min-w-0 flex-1`} />
          <Button variant="soft" onClick={addCustom}>Add</Button>
        </div>
        {error && <p role="alert" className="mt-2 text-sm text-terracotta">{error}</p>}
      </Card>

      <Card>
        <h2 className="font-display text-xl font-semibold">Phone reminders</h2>
        <p className="mt-1 text-sm text-muted">Sugar Saathi has no server to send notifications, so it makes a calendar file instead. Your phone&apos;s own calendar then sounds the alerts every day, even when this app is closed.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {([["breakfast", "Breakfast"], ["lunch", "Lunch"], ["dinner", "Dinner"]] as const).map(([k, l]) => (
            <label key={k} className="flex items-center justify-between gap-3 text-sm">{l}
              <input type="time" value={reminders[k]} onChange={(e) => e.target.value && setR({ [k]: e.target.value } as Partial<Reminders>)} className={input} />
            </label>
          ))}
          <label className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2"><input type="checkbox" className="h-5 w-5" checked={reminders.snack !== null} onChange={(e) => setR({ snack: e.target.checked ? "17:00" : null })} /> Snack</span>
            {reminders.snack !== null && <input type="time" value={reminders.snack} onChange={(e) => e.target.value && setR({ snack: e.target.value })} className={input} />}
          </label>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          <label className="flex min-h-11 items-center gap-2"><input type="checkbox" className="h-5 w-5" checked={reminders.checks} onChange={(e) => setR({ checks: e.target.checked })} /> Remind me to check my sugar 2 hours after each meal</label>
          <label className="flex min-h-11 items-center gap-2"><input type="checkbox" className="h-5 w-5" checked={reminders.walks} onChange={(e) => setR({ walks: e.target.checked })} /> Remind me to take a walk after each meal</label>
        </div>
        <Button className="mt-3" onClick={download}>Download calendar reminders</Button>
        <p className="mt-2 text-xs text-muted">Open the downloaded file and your calendar adds the repeating alerts. To stop them, delete the &quot;Sugar Saathi&quot; events from your calendar.</p>
      </Card>
    </div>
  );
}
