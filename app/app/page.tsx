"use client";

import Link from "next/link";
import CheckinCard from "@/components/habit/CheckinCard";
import RoutineCard from "@/components/habit/RoutineCard";
import WalkTimer from "@/components/habit/WalkTimer";
import WeekDots from "@/components/habit/WeekDots";
import WrapUpCard from "@/components/habit/WrapUpCard";
import GlucoseQuickAdd from "@/components/GlucoseQuickAdd";
import MealCard from "@/components/MealCard";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DayRing } from "@/components/ui/DayRing";
import { GlucoseChart } from "@/components/ui/GlucoseChart";
import { StreakChip } from "@/components/ui/StreakChip";
import { FOODS } from "@/lib/foods-client";
import { MEAL_EMOJI, MEAL_LABEL, MEAL_TYPES } from "@/lib/meal";
import { weeklyCheckin } from "@/lib/checkin";
import { dayKey } from "@/lib/day";
import { weeklyObservations } from "@/lib/insights";
import { rangeAlert } from "@/lib/safety";
import { reportText } from "@/lib/share";
import { dayWrapUp } from "@/lib/wrapup";
import { saathiSays } from "@/lib/saathi";
import { weekStats } from "@/lib/stats";
import { streakOf } from "@/lib/streak";
import { nowMs } from "@/lib/time";
import { useRecent } from "@/lib/useRecent";

const localInput = (ms: number) => {
  const d = new Date(ms);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export default function Today() {
  const { ready, meals, readings, paired, profile, walks, timer, checkinAt, wrapupDismissed } = useRecent(365);
  if (!ready) return <p className="text-muted">Loading…</p>;

  const now = new Date(nowMs());
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const todayMeals = paired.filter((m) => new Date(m.eaten_at) >= startOfDay).sort((a, b) => a.eaten_at.localeCompare(b.eaten_at));
  const weekCut = nowMs() - 7 * 86400_000;
  const week = paired.filter((m) => new Date(m.eaten_at).getTime() >= weekCut);
  const stats = weekStats(week, readings.filter((r) => new Date(r.measured_at).getTime() >= weekCut), profile, FOODS);
  const streak = streakOf(meals, now);

  const sum = (k: "carbs" | "protein" | "fibre" | "fat" | "kcal") => Math.round(todayMeals.reduce((a, m) => a + m[k], 0) * 10) / 10;
  const budget = profile.meal_carb_target * 3;
  const carbsToday = Math.round(sum("carbs"));
  const left = budget - carbsToday;

  const todayReadings = readings.filter((r) => new Date(r.measured_at) >= startOfDay).sort((a, b) => a.measured_at.localeCompare(b.measured_at));
  const latest = readings[0]; // readings are newest first
  const alert = latest && nowMs() - new Date(latest.measured_at).getTime() < 3 * 3600_000 ? rangeAlert(latest.value, profile) : null;

  const due = todayMeals.filter((m) => {
    const age = nowMs() - new Date(m.eaten_at).getTime();
    return m.post === null && age >= 75 * 60_000 && age <= 3 * 3600_000;
  });

  const dayOfYear = Math.floor((nowMs() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400_000);
  const says = saathiSays({ stats, todayMeals: todayMeals.length, profile, dayOfYear });
  const hasAnything = meals.length > 0 || readings.length > 0;

  // Habit layer
  const todayKey = dayKey(now);
  const loggedDays = new Set(meals.map((m) => dayKey(new Date(m.eaten_at))));
  const lastMeal = todayMeals[todayMeals.length - 1];
  const sinceMeal = lastMeal ? nowMs() - new Date(lastMeal.eaten_at).getTime() : Infinity;
  const walkedSince = lastMeal ? walks.some((w) => new Date(w.started_at).getTime() >= new Date(lastMeal.eaten_at).getTime()) : false;
  const offerWalk = !timer && lastMeal !== undefined && sinceMeal < 90 * 60_000 && !walkedSince;

  const daysSinceCheckin = checkinAt ? (nowMs() - new Date(checkinAt).getTime()) / 86400_000 : Infinity;
  const checkinDue = stats.meals >= 4 && daysSinceCheckin >= 7;
  const observations = weeklyObservations(stats, profile);
  const checkin = weeklyCheckin(stats, profile);
  const shareBody = reportText({ name: profile.display_name, stats, observations, profile, from: new Date(weekCut), to: now });

  const wrapDue = hour >= 19 && todayMeals.length > 0 && wrapupDismissed !== todayKey;
  const wrap = wrapDue ? dayWrapUp(todayMeals, FOODS, profile, todayReadings) : null;

  return (
    <>
      <header className="rise-in flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">{greeting}{profile.display_name ? `, ${profile.display_name}` : ""}</h1>
        </div>
        <StreakChip streak={streak} />
      </header>

      {alert && (
        <Card tone="alert" role="alert" className="rise-in">
          <h2 className="font-display text-lg font-semibold">{alert.title}</h2>
          <p className="mt-1 text-sm">{alert.body}</p>
        </Card>
      )}

      {!hasAnything && (
        <Card tone="moss" className="rise-in">
          <h2 className="font-display text-2xl font-semibold">Welcome to Sugar Saathi</h2>
          <ol className="mt-3 space-y-2 text-white/90">
            <li>1. Log what you eat. Say it, type it or snap a photo.</li>
            <li>2. See carbs, protein, fibre, fat and how it may affect your sugar.</li>
            <li>3. Add a reading before and 2 hours after, and the app learns what meals do to you.</li>
          </ol>
          <ButtonLink href="/app/log" variant="saffron" size="lg" className="mt-4">Log your first meal</ButtonLink>
          <p className="mt-3 text-xs text-white/70">Everything stays in this browser on this device. Use Me to back it up.</p>
        </Card>
      )}

      <div className="grid gap-5 md:grid-cols-[1.1fr_1fr]">
        <Card className="rise-in">
          <h2 className="font-display text-xl font-semibold">Today</h2>
          <div className="mt-3 flex items-center gap-5">
            <DayRing value={carbsToday} max={budget} caption="carbs today" />
            <div className="space-y-1.5 text-sm">
              <p className="text-lg font-semibold">{left >= 0 ? `${left} g left` : `${-left} g over`}</p>
              <p className="text-muted">Daily budget is 3 × your {profile.meal_carb_target} g meal goal.</p>
              <p className="tabular">Protein <strong>{sum("protein")} g</strong></p>
              <p className="tabular">Fibre <strong>{sum("fibre")} g</strong></p>
              <p className="tabular">Fat <strong>{sum("fat")} g</strong> · <strong>{Math.round(sum("kcal"))}</strong> kcal</p>
            </div>
          </div>
        </Card>

        <Card tone="sand" className="rise-in">
          <h2 className="font-display text-xl font-semibold">Saathi says</h2>
          <p className="mt-2 text-lg leading-snug">{says}</p>
          <div className="mt-4 flex items-end justify-between gap-3">
            <WeekDots logged={loggedDays} now={now} />
            <p className="text-xs text-muted">{streak.loggedLast7} of 7 days logged</p>
          </div>
        </Card>
      </div>

      {due.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold">Time for a 2-hour check</h2>
          {due.map((m) => (
            <Card key={m.id} tone="saffron">
              <p className="font-medium">{m.text}</p>
              <p className="text-sm text-muted">Eaten at {new Date(m.eaten_at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}. What is your sugar now? Around 2 hours after eating is best; anything from 1.5 to 3 hours is counted.</p>
              <div className="mt-2">
                <GlucoseQuickAdd compact defaultTime={localInput(nowMs())} label="Save 2-hour reading" />
              </div>
            </Card>
          ))}
        </section>
      )}

      <WalkTimer offer={offerWalk} />

      {checkinDue && <CheckinCard checkin={checkin} text={shareBody} />}
      {wrap && <WrapUpCard wrap={wrap} day={todayKey} />}

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Your meals today</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {MEAL_TYPES.map((t) => {
            const logged = todayMeals.filter((m) => m.meal_type === t);
            return (
              <div key={t} className="space-y-2">
                {logged.map((m) => <MealCard key={m.id} meal={m} foods={FOODS} />)}
                {logged.length === 0 && (
                  <Link href={`/app/log?slot=${t}`} className="flex min-h-20 items-center gap-3 rounded-3xl border border-dashed border-line bg-paper/60 px-4 py-3 text-muted hover:bg-sand">
                    <span className="text-2xl" aria-hidden="true">{MEAL_EMOJI[t]}</span>
                    <span>
                      <span className="block font-medium text-ink">{MEAL_LABEL[t]}</span>
                      <span className="block text-sm">Not logged yet. Tap to add.</span>
                    </span>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <RoutineCard />

      {todayReadings.length > 0 && (
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Sugar today</h2>
            <Link href="/app/glucose" className="text-sm font-medium text-moss underline">Add or import readings</Link>
          </div>
          <div className="mt-2">
            <GlucoseChart
              points={todayReadings.slice(-60).map((r) => ({ t: new Date(r.measured_at).getTime(), v: r.value }))}
              markers={todayMeals.map((m) => ({ t: new Date(m.eaten_at).getTime(), label: MEAL_LABEL[m.meal_type] }))}
              low={profile.glucose_low}
              high={profile.glucose_high}
              ariaLabel="Today's glucose readings with meals marked"
            />
          </div>
        </Card>
      )}

      {hasAnything && todayReadings.length === 0 && (
        <Card tone="sand">
          <h2 className="font-display text-lg font-semibold">Add a reading</h2>
          <p className="mb-2 text-sm text-muted">Readings let the app show what each meal does to you.</p>
          <GlucoseQuickAdd />
        </Card>
      )}
    </>
  );
}
