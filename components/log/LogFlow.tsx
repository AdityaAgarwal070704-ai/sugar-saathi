"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import MealReport from "@/components/MealReport";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DishPicker } from "@/components/ui/DishPicker";
import { CameraIcon, CheckIcon, CloseIcon, MicIcon } from "@/components/ui/icons";
import { MacroRing } from "@/components/ui/MacroRing";
import { Pill } from "@/components/ui/Pill";
import { Stepper } from "@/components/ui/Stepper";
import { nutritionOf } from "@/lib/carbs";
import { enrichMeal } from "@/lib/enrich";
import { useFoods } from "@/lib/useFoods";
import { parseReading } from "@/lib/glucose";
import { guessMealType, isMealType, MEAL_EMOJI, MEAL_TYPES } from "@/lib/meal";
import { unitLabel } from "@/lib/i18n";
import { useT } from "@/lib/useT";
import { pairMeals } from "@/lib/pairing";
import { photoToJpegDataUrl } from "@/lib/photo";
import { store, useStore } from "@/lib/store";
import { usualMeals } from "@/lib/usual";
import { listen, speechSupported, type VoiceLang } from "@/lib/voice";
import type { Item, MealType, ParseResponse, SavedItem } from "@/lib/types";

const MAX_TEXT = 300;

const localInput = (iso: string | number) => {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

type Step = "describe" | "review" | "report";
type Source = "text" | "photo" | "usual" | "edit";

export default function LogFlow() {
  const { ready } = useStore();
  const { t: tr } = useT();
  if (!ready) return <p className="text-muted">{tr("common.loading")}</p>;
  return <LogFlowInner />;
}

function LogFlowInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { meals, readings, profile, customFoods } = useStore();
  const FOODS = useFoods();
  const { t: tr, lang, name } = useT();
  const { can } = useAuth();

  const editId = params.get("edit");
  const fromId = params.get("from");
  const base = meals.find((m) => m.id === (editId ?? fromId)) ?? null;
  const slot = params.get("slot");
  const dishParam = params.get("dish");
  const startDish = !base && dishParam ? FOODS.find((f) => f.id === dishParam) : undefined;

  const [step, setStep] = useState<Step>(base || startDish ? "review" : "describe");
  const [source, setSource] = useState<Source>(base ? (editId ? "edit" : "usual") : startDish ? "usual" : "text");
  const [text, setText] = useState(base?.text ?? startDish?.name ?? "");
  const [items, setItems] = useState<Item[]>(() => (base ? base.items.map((i) => ({ key: crypto.randomUUID(), typed: i.typed, foodId: i.foodId, count: i.count, confidence: 1 })) : startDish ? [{ key: crypto.randomUUID(), typed: startDish.name, foodId: startDish.id, count: 1, confidence: 1 }] : []));
  const [mealType, setMealType] = useState<MealType>(base && editId ? base.meal_type : isMealType(slot) ? slot : guessMealType(new Date().getHours()));
  // If the user never picks a meal type themselves, we choose it from the time they ate.
  const [typeChosen, setTypeChosen] = useState(Boolean((base && editId) || isMealType(slot)));
  const [eatenAt, setEatenAt] = useState(() => localInput(base && editId ? base.eaten_at : Date.now()));
  const [pre, setPre] = useState("");
  const [loading, setLoading] = useState<null | "text" | "photo">(null);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState<VoiceLang>("en-IN");
  const stopRef = useRef<(() => void) | null>(null);
  const [saved, setSaved] = useState<{ id: string; items: SavedItem[]; mealType: MealType; eatenAt: string } | null>(null);

  const usual = usualMeals(meals, 4);
  const lines = items.filter((i) => i.foodId !== null).map((i) => ({ foodId: i.foodId as string, count: i.count, typed: i.typed }));
  const n = nutritionOf(lines, FOODS);
  const unknown = items.filter((i) => i.foodId === null).length;
  const history = pairMeals(meals.map((m) => enrichMeal(m, FOODS)), readings);
  const hiTime = (iso: string) => new Date(iso).toLocaleTimeString(lang === "hi" ? "hi-IN" : "en-IN", { hour: "numeric", minute: "2-digit" });

  const takeItems = (parsed: ParseResponse["items"], from: Source) => {
    const next = parsed
      .map((i) => ({ ...i, key: crypto.randomUUID() }))
      // Items the AI is unsure about go first so they get noticed.
      .sort((a, b) => Number(a.confidence >= 0.7 && a.foodId !== null) - Number(b.confidence >= 0.7 && b.foodId !== null));
    setItems(next);
    setSource(from);
    setStep("review");
  };

  const estimate = async () => {
    if (text.trim() === "") return setError(tr("log.errType"));
    if (text.length > MAX_TEXT) return setError(tr("log.errLong"));
    setLoading("text");
    setError(null);
    try {
      const res = await fetch("/api/parse-meal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, custom: customFoods.map((f) => ({ id: f.id, name: f.name })) }) });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) return setError(data?.error ?? tr("log.errAi"));
      const parsed = data as ParseResponse;
      if (parsed.items.length === 0) return setError(tr("log.errNoFood"));
      takeItems(parsed.items, "text");
    } catch {
      setError(tr("log.errAi"));
    } finally {
      setLoading(null);
    }
  };

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setLoading("photo");
    setError(null);
    try {
      const image = await photoToJpegDataUrl(file);
      const res = await fetch("/api/parse-photo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image, custom: customFoods.map((f) => ({ id: f.id, name: f.name })) }) });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) return setError(data?.error ?? tr("log.errPhoto"));
      const parsed = data as ParseResponse;
      if (parsed.items.length === 0) return setError(tr("log.errPhotoNone"));
      setText(parsed.items.map((i) => i.typed).join(", "));
      takeItems(parsed.items, "photo");
    } catch {
      setError(tr("log.errPhoto"));
    } finally {
      setLoading(null);
    }
  };

  const toggleVoice = () => {
    if (listening) {
      stopRef.current?.();
      return;
    }
    setError(null);
    setListening(true);
    stopRef.current = listen({
      lang: voiceLang,
      onText: (t) => setText((prev) => (prev.trim() ? `${prev.trim()}, ${t}` : t).slice(0, MAX_TEXT)),
      onEnd: () => setListening(false),
      onError: (m) => setError(m),
    });
  };

  const update = (key: string, patch: Partial<Item>) => setItems((cur) => cur.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  const remove = (key: string) => setItems((cur) => cur.filter((i) => i.key !== key));
  const add = (foodId: string) => setItems((cur) => [...cur, { key: crypto.randomUUID(), typed: "added by you", foodId, count: 1, confidence: 1 }]);

  const save = () => {
    setSaveError(null);
    const when = new Date(eatenAt);
    if (Number.isNaN(when.getTime())) return setSaveError(tr("log.errTime"));
    if (when.getTime() > Date.now() + 5 * 60_000) return setSaveError(tr("log.errFuture"));
    let preValue: number | null = null;
    if (pre.trim() !== "") {
      const p = parseReading(pre);
      if (!p.ok) return setSaveError(tr("log.errBefore", { msg: p.message }));
      preValue = p.value;
    }
    const finalType: MealType = typeChosen ? mealType : guessMealType(when.getHours());
    const label = (text.trim() || lines.map((l) => FOODS.find((f) => f.id === l.foodId)?.name).join(", ")).slice(0, 300);
    const row = { eaten_at: when.toISOString(), meal_type: finalType, text: label, items: lines, carbs: n.carbs, fibre: n.fibre, protein: n.protein, gl: n.gl };
    let id: string;
    if (editId && base) {
      if (!store.updateMeal(editId, row)) return setSaveError(tr("log.errStorage"));
      id = editId;
    } else {
      const r = store.addMeal(row);
      if (!r.ok) return setSaveError(tr("log.errStorage"));
      id = r.id;
    }
    if (preValue !== null) store.addReadings([{ measured_at: when.toISOString(), value: preValue, source: "manual" }]);
    setSaved({ id, items: lines, mealType: finalType, eatenAt: when.toISOString() });
    setStep("report");
  };

  const restart = () => {
    setStep("describe");
    setText("");
    setItems([]);
    setPre("");
    setSaved(null);
    setError(null);
    setEatenAt(localInput(Date.now()));
    setMealType(guessMealType(new Date().getHours()));
    setTypeChosen(false);
    if (editId || fromId) router.replace("/app/log");
  };

  // ---------------------------------------------------------------- describe
  if (step === "describe") {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="font-display text-3xl font-semibold">{tr("log.title")}</h1>
          <p className="mt-1 text-muted">{tr("log.sub")}</p>
        </div>

        <MealTypeChips value={typeChosen ? mealType : guessMealType(new Date(eatenAt).getHours())} onChange={(t) => { setMealType(t); setTypeChosen(true); }} />

        <Card className="space-y-3">
          <label htmlFor="meal" className="sr-only">{tr("log.title")}</label>
          <textarea id="meal" rows={3} maxLength={MAX_TEXT} value={text} onChange={(e) => setText(e.target.value)} placeholder={tr("log.placeholder")} className="w-full resize-none rounded-2xl border border-line bg-cream p-4 text-lg outline-none focus:border-moss" />
          <div className="flex flex-wrap items-center gap-2">
            {speechSupported() && (
              <>
                <Button variant={listening ? "saffron" : "soft"} onClick={toggleVoice} aria-pressed={listening}>
                  <MicIcon className="h-5 w-5" /> {listening ? tr("log.listening") : tr("log.speak")}
                </Button>
                <div className="inline-flex rounded-full border border-line p-0.5 text-sm" role="group" aria-label="Voice language">
                  {([["en-IN", "English"], ["hi-IN", "हिन्दी"]] as const).map(([v, l]) => (
                    <button key={v} type="button" onClick={() => setVoiceLang(v)} aria-pressed={voiceLang === v} className={`rounded-full px-3 py-1.5 ${voiceLang === v ? "bg-moss text-white" : "text-ink"}`}>{l}</button>
                  ))}
                </div>
              </>
            )}
            {can("photo") ? (
              <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-moss-soft px-5 font-medium text-moss hover:bg-[#d3e6da]">
                <CameraIcon className="h-5 w-5" /> {tr("log.photo")}
                <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={onPhoto} disabled={loading !== null} />
              </label>
            ) : (
              <Button variant="soft" onClick={() => setError("Photo logging is part of Pro. Pro is coming soon. You can still type or speak your meal on Free.")}>
                <CameraIcon className="h-5 w-5" /> {tr("log.photo")} 🔒
              </Button>
            )}
            <span className="ml-auto text-xs text-muted tabular">{text.length}/{MAX_TEXT}</span>
          </div>
          {error && <p role="alert" className="rounded-2xl bg-terracotta-soft px-4 py-2 text-sm text-terracotta">{error}</p>}
          <Button size="lg" className="w-full" onClick={estimate} disabled={loading !== null || text.trim() === ""}>
            {loading === "text" ? tr("log.reading") : loading === "photo" ? tr("log.looking") : tr("log.see")}
          </Button>
          <p className="text-xs text-muted">{tr("log.photoNote")}</p>
        </Card>

        {usual.length > 0 && (
          <section>
            <h2 className="mb-2 font-display text-lg font-semibold">{tr("log.usual")}</h2>
            <div className="flex flex-wrap gap-2">
              {usual.map((u) => (
                <Link key={u.id} href={`/app/log?from=${u.id}&slot=${mealType}`} className="rounded-full border border-line bg-paper px-4 py-2 text-sm hover:bg-sand">
                  ↻ {u.text.length > 38 ? `${u.text.slice(0, 36)}…` : u.text}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  // ------------------------------------------------------------------ report
  if (step === "report" && saved) {
    const checkAt = new Date(new Date(saved.eatenAt).getTime() + 120 * 60_000);
    return (
      <div className="space-y-4">
        <div className="rise-in flex items-center gap-3">
          <span className="pop-in flex h-12 w-12 items-center justify-center rounded-full bg-moss text-white"><CheckIcon className="h-7 w-7" /></span>
          <div>
            <h1 className="font-display text-3xl font-semibold">{editId ? tr("log.updated") : tr("log.saved")}</h1>
            <p className="text-muted">{tr("log.hereIs")}</p>
          </div>
        </div>

        <MealReport items={saved.items} mealType={saved.mealType} foods={FOODS} profile={profile} history={history} mealId={saved.id} />

        <Card tone="sand">
          <h2 className="font-display text-lg font-semibold">{tr("log.closeLoop")}</h2>
          <p className="mt-1 text-sm">{tr("log.closeBody", { time: hiTime(checkAt.toISOString()) })}</p>
        </Card>

        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/app" size="lg">{tr("common.done")}</ButtonLink>
          <ButtonLink href={`/app/meal/${saved.id}`} variant="outline" size="lg">{tr("log.view")}</ButtonLink>
          <Button variant="ghost" size="lg" onClick={restart}>{tr("log.another")}</Button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------ review
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">{editId ? tr("log.edit") : tr("log.check")}</h1>
          <p className="mt-1 text-muted">{tr("log.reviewSub")}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={restart} aria-label={tr("log.startOver")} className="shrink-0 whitespace-nowrap"><CloseIcon className="h-4 w-4" /> {tr("log.startOver")}</Button>
      </div>

      {source === "photo" && <p className="rounded-2xl bg-saffron-soft px-4 py-3 text-sm">{tr("log.fromPhoto")}</p>}

      <Card tone="moss" className="grid grid-cols-[auto_1fr] items-center gap-5" aria-live="polite">
        <MacroRing carbs={n.carbs} protein={n.protein} fat={n.fat} kcal={n.kcal} size={112} onDark />
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <Figure label={tr("macro.carbs")} value={`${n.carbs} g`} />
          <Figure label={tr("macro.protein")} value={`${n.protein} g`} />
          <Figure label={tr("macro.fibre")} value={`${n.fibre} g`} />
          <Figure label={tr("macro.fat")} value={`${n.fat} g`} />
          {unknown > 0 && <p className="col-span-2 rounded-xl bg-white/15 px-3 py-1.5 text-xs">{tr("log.notCounted", { n: unknown })}</p>}
        </div>
      </Card>

      <ul className="space-y-3">
        {items.map((it) => {
          const food = FOODS.find((f) => f.id === it.foodId);
          return (
            <li key={it.key}>
              <Card className={`space-y-3 !p-4 ${!food ? "!border-terracotta/50 !bg-terracotta-soft" : it.confidence < 0.7 ? "!border-saffron" : ""}`}>
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <DishPicker foods={FOODS} value={it.foodId} onChange={(id) => update(it.key, { foodId: id, confidence: 1 })} placeholder={tr("log.pickDish", { typed: it.typed })} triggerClassName="w-full" />
                  </div>
                  <button type="button" onClick={() => remove(it.key)} aria-label={`${tr("walk.cancel")} ${it.typed}`} className="rounded-full p-2 text-muted hover:bg-sand"><CloseIcon className="h-5 w-5" /></button>
                </div>
                <p className="text-xs text-muted">{tr("log.youSaid", { typed: it.typed })}{it.confidence < 0.7 && food ? <Pill tone="warn" className="ml-2">{tr("log.checkThis")}</Pill> : null}</p>
                {food ? (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Stepper label={`${name(food)} (${unitLabel(tr, food.unit, 2)})`} value={it.count} onChange={(v) => update(it.key, { count: v })} />
                      <span className="text-sm text-muted">{unitLabel(tr, food.unit, it.count)}</span>
                    </div>
                    <p className="tabular text-sm"><strong>{Math.round(food.carbs * it.count)} g</strong> {tr("macro.carbs")} · {Math.round(food.protein * it.count * 10) / 10} g {tr("macro.protein")} · {Math.round(food.fibre * it.count * 10) / 10} g {tr("macro.fibre")}</p>
                  </div>
                ) : (
                  <p className="text-sm text-terracotta">{tr("log.unmatched")}</p>
                )}
              </Card>
            </li>
          );
        })}
      </ul>

      <DishPicker foods={FOODS} value={null} onChange={add} placeholder={tr("log.addDish")} triggerClassName="w-full !border-dashed" />

      <Card className="space-y-3">
        <h2 className="font-display text-lg font-semibold">{tr("log.details")}</h2>
        <MealTypeChips value={typeChosen ? mealType : guessMealType(new Date(eatenAt).getHours())} onChange={(t) => { setMealType(t); setTypeChosen(true); }} />
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <label className="flex items-center gap-2">{tr("log.when")} <input type="datetime-local" value={eatenAt} onChange={(e) => setEatenAt(e.target.value)} className="min-h-11 rounded-xl border border-line bg-cream px-3" /></label>
          <label className="flex items-center gap-2">{tr("log.sugarBefore")} <input inputMode="numeric" placeholder="mg/dL" value={pre} onChange={(e) => setPre(e.target.value)} className="min-h-11 w-24 rounded-xl border border-line bg-cream px-3" /></label>
        </div>
      </Card>

      {saveError && <p role="alert" className="rounded-2xl bg-terracotta-soft px-4 py-2 text-sm text-terracotta">{saveError}</p>}
      <Button size="lg" className="w-full" onClick={save} disabled={lines.length === 0}>{editId ? tr("log.saveChanges") : tr("log.saveMeal")}</Button>
      {lines.length === 0 && <p className="text-center text-sm text-muted">{tr("log.addOne")}</p>}
    </div>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-white/70">{label}</p>
      <p className="tabular text-xl font-semibold">{value}</p>
    </div>
  );
}

function MealTypeChips({ value, onChange }: { value: MealType; onChange: (t: MealType) => void }) {
  const { t: tr } = useT();
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={tr("log.which")}>
      {MEAL_TYPES.map((m) => (
        <button key={m} type="button" onClick={() => onChange(m)} aria-pressed={value === m} className={`min-h-11 rounded-full px-4 text-sm font-medium ${value === m ? "bg-moss text-white" : "border border-line bg-paper hover:bg-sand"}`}>
          <span aria-hidden="true">{MEAL_EMOJI[m]}</span> {tr(`slot.${m}` as const)}
        </button>
      ))}
    </div>
  );
}
