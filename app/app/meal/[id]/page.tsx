"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import GlucoseQuickAdd from "@/components/GlucoseQuickAdd";
import MealReport from "@/components/MealReport";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlucoseChart } from "@/components/ui/GlucoseChart";
import { Pill } from "@/components/ui/Pill";
import { FOODS } from "@/lib/foods-client";
import { MEAL_EMOJI, MEAL_LABEL } from "@/lib/meal";
import { store } from "@/lib/store";
import { nowMs } from "@/lib/time";
import { readingsAround } from "@/lib/trends";
import { useRecent } from "@/lib/useRecent";

const localInput = (ms: number) => {
  const d = new Date(ms);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export default function MealDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { ready, paired, readings, profile } = useRecent(3650);
  if (!ready) return <p className="text-muted">Loading…</p>;

  const meal = paired.find((m) => m.id === id);
  if (!meal) {
    return (
      <EmptyState title="Meal not found" action={<ButtonLink href="/app">Back to Today</ButtonLink>}>
        This meal may have been deleted, or it was saved in a different browser.
      </EmptyState>
    );
  }

  const around = readingsAround(readings, meal.eaten_at);
  const eatenMs = new Date(meal.eaten_at).getTime();
  const otherMeals = paired.filter((m) => m.id !== meal.id);

  const del = () => {
    if (window.confirm("Delete this meal?")) {
      store.deleteMeal(meal.id);
      router.replace("/app");
    }
  };

  return (
    <>
      <div className="rise-in">
        <Link href="/app/progress" className="text-sm font-medium text-moss underline">← All meals</Link>
        <p className="mt-3 text-sm text-muted">{MEAL_EMOJI[meal.meal_type]} {MEAL_LABEL[meal.meal_type]} · {new Date(meal.eaten_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
        <h1 className="font-display text-3xl font-semibold">{meal.text}</h1>
        <p className="mt-2 text-2xl" aria-hidden="true">{[...new Set(meal.items.map((i) => FOODS.find((f) => f.id === i.foodId)?.icon).filter(Boolean))].join(" ")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <ButtonLink href={`/app/log?edit=${meal.id}`} variant="outline" size="sm">Edit dishes or time</ButtonLink>
          <ButtonLink href={`/app/log?from=${meal.id}`} variant="soft" size="sm">Log this again</ButtonLink>
          <Button variant="danger" size="sm" onClick={del}>Delete</Button>
        </div>
      </div>

      <Card>
        <h2 className="font-display text-xl font-semibold">What it did to your sugar</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <Pill>{meal.pre ? `Before: ${meal.pre.value} mg/dL` : "No before reading"}</Pill>
          <Pill>{meal.post ? `2 hours after: ${meal.post.value} mg/dL` : "No 2-hour reading"}</Pill>
          {meal.rise !== null && <Pill tone={meal.rise > 60 ? "high" : meal.rise > 30 ? "warn" : "good"}>Rise {meal.rise > 0 ? "+" : ""}{meal.rise} mg/dL</Pill>}
        </div>
        {around.length > 0 ? (
          <div className="mt-3">
            <GlucoseChart points={around.map((r) => ({ t: new Date(r.measured_at).getTime(), v: r.value }))} markers={[{ t: eatenMs, label: "Meal" }]} low={profile.glucose_low} high={profile.glucose_high} ariaLabel="Glucose from 30 minutes before to 3 hours after this meal" />
            <p className="mt-1 text-xs text-muted">Readings from 30 minutes before to 3 hours after. The green band is your range.</p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">Add a reading from just before this meal and one 2 hours after to see its effect on you.</p>
        )}
        {(!meal.pre || !meal.post) && (
          <div className="mt-4 space-y-3 border-t border-line pt-4">
            {!meal.pre && (
              <div>
                <p className="mb-1 text-sm font-medium">Reading from just before the meal</p>
                <GlucoseQuickAdd defaultTime={localInput(eatenMs)} label="Save" />
              </div>
            )}
            {!meal.post && (
              <div>
                <p className="mb-1 text-sm font-medium">Reading from about 2 hours after</p>
                <GlucoseQuickAdd defaultTime={localInput(Math.min(eatenMs + 120 * 60_000, nowMs()))} label="Save" />
              </div>
            )}
          </div>
        )}
      </Card>

      <MealReport items={meal.items} mealType={meal.meal_type} foods={FOODS} profile={profile} history={otherMeals} mealId={meal.id} />
    </>
  );
}
