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
import { MEAL_EMOJI, MEAL_TYPES } from "@/lib/meal";
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
import { useT } from "@/lib/useT";

const localInput = (ms: number) => {
  const d = new Date(ms);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export default function Today() {
  const { ready, meals, readings, paired, profile, walks, timer, checkinAt, wrapupDismissed, foods: FOODS } = useRecent(365);
  const { t, lang } = useT();
  if (!ready) return <p className="text-muted">{t("common.loading")}</p>;

  const now = new Date(nowMs());
  const hour = now.getHours();
  const greeting = hour < 12 ? t("today.morning") : hour < 17 ? t("today.afternoon") : t("today.evening");
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
  const alert = latest && nowMs() - new Date(latest.measured_at).getTime() < 3 * 3600_000 ? rangeAlert(latest.value, profile, t) : null;

  const due = todayMeals.filter((m) => {
    const age = nowMs() - new Date(m.eaten_at).getTime();
    return m.post === null && age >= 75 * 60_000 && age <= 3 * 3600_000;
  });

  const dayOfYear = Math.floor((nowMs() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400_000);
  const says = saathiSays({ stats, todayMeals: todayMeals.length, profile, dayOfYear }, { t, lang });
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
  const checkin = weeklyCheckin(stats, profile, { t, lang });
  const shareBody = reportText({ name: profile.display_name, stats, observations, profile, from: new Date(weekCut), to: now });

  const wrapDue = hour >= 19 && todayMeals.length > 0 && wrapupDismissed !== todayKey;
  const wrap = wrapDue ? dayWrapUp(todayMeals, FOODS, profile, todayReadings, { t, lang }) : null;

  return (
    <>
      <header className="rise-in flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{now.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
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
          <h2 className="font-display text-2xl font-semibold">{t("today.welcomeTitle")}</h2>
          <ol className="mt-3 space-y-2 text-white/90">
            <li>{t("today.welcome1")}</li>
            <li>{t("today.welcome2")}</li>
            <li>{t("today.welcome3")}</li>
          </ol>
          <ButtonLink href="/app/log" variant="saffron" size="lg" className="mt-4">{t("today.logFirst")}</ButtonLink>
          <p className="mt-3 text-xs text-white/70">{t("today.privacy")}</p>
        </Card>
      )}

      <div className="grid gap-5 md:grid-cols-[1.1fr_1fr]">
        <Card className="rise-in">
          <h2 className="font-display text-xl font-semibold">{t("today.title")}</h2>
          <div className="mt-3 flex items-center gap-5">
            <DayRing value={carbsToday} max={budget} caption="carbs today" />
            <div className="space-y-1.5 text-sm">
              <p className="text-lg font-semibold">{left >= 0 ? t("today.left", { n: left }) : t("today.over", { n: -left })}</p>
              <p className="text-muted">{t("today.budget", { n: profile.meal_carb_target })}</p>
              <p className="tabular">{t("macro.protein")} <strong>{sum("protein")} g</strong></p>
              <p className="tabular">{t("macro.fibre")} <strong>{sum("fibre")} g</strong></p>
              <p className="tabular">{t("macro.fat")} <strong>{sum("fat")} g</strong> · <strong>{Math.round(sum("kcal"))}</strong> {t("macro.kcal")}</p>
            </div>
          </div>
        </Card>

        <Card tone="sand" className="rise-in">
          <h2 className="font-display text-xl font-semibold">{t("today.saathi")}</h2>
          <p className="mt-2 text-lg leading-snug">{says}</p>
          <div className="mt-4 flex items-end justify-between gap-3">
            <WeekDots logged={loggedDays} now={now} />
            <p className="text-xs text-muted">{t("today.daysLogged", { n: streak.loggedLast7 })}</p>
          </div>
        </Card>
      </div>

      {due.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold">{t("today.checkTitle")}</h2>
          {due.map((m) => (
            <Card key={m.id} tone="saffron">
              <p className="font-medium">{m.text}</p>
              <p className="text-sm text-muted">{t("today.checkBody", { time: new Date(m.eaten_at).toLocaleTimeString(lang === "hi" ? "hi-IN" : "en-IN", { hour: "numeric", minute: "2-digit" }) })}</p>
              <div className="mt-2">
                <GlucoseQuickAdd compact defaultTime={localInput(nowMs())} label={t("today.save2h")} />
              </div>
            </Card>
          ))}
        </section>
      )}

      <WalkTimer offer={offerWalk} />

      {checkinDue && <CheckinCard checkin={checkin} text={shareBody} />}
      {wrap && <WrapUpCard wrap={wrap} day={todayKey} />}

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">{t("today.mealsToday")}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {MEAL_TYPES.map((slot) => {
            const logged = todayMeals.filter((m) => m.meal_type === slot);
            return (
              <div key={slot} className="space-y-2">
                {logged.map((m) => <MealCard key={m.id} meal={m} foods={FOODS} />)}
                {logged.length === 0 && (
                  <Link href={`/app/log?slot=${slot}`} className="flex min-h-20 items-center gap-3 rounded-3xl border border-dashed border-line bg-paper/60 px-4 py-3 text-muted hover:bg-sand">
                    <span className="text-2xl" aria-hidden="true">{MEAL_EMOJI[slot]}</span>
                    <span>
                      <span className="block font-medium text-ink">{t(`slot.${slot}` as const)}</span>
                      <span className="block text-sm">{t("today.notLogged")}</span>
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
            <h2 className="font-display text-xl font-semibold">{t("today.sugarToday")}</h2>
            <Link href="/app/glucose" className="inline-block py-2 text-sm font-medium text-moss underline">{t("today.addImport")}</Link>
          </div>
          <div className="mt-2">
            <GlucoseChart
              points={todayReadings.slice(-60).map((r) => ({ t: new Date(r.measured_at).getTime(), v: r.value }))}
              markers={todayMeals.map((m) => ({ t: new Date(m.eaten_at).getTime(), label: t(`slot.${m.meal_type}` as const) }))}
              low={profile.glucose_low}
              high={profile.glucose_high}
              ariaLabel="Today's glucose readings with meals marked"
            />
          </div>
        </Card>
      )}

      {hasAnything && todayReadings.length === 0 && (
        <Card tone="sand">
          <h2 className="font-display text-lg font-semibold">{t("today.addReading")}</h2>
          <p className="mb-2 text-sm text-muted">{t("today.addReadingBody")}</p>
          <GlucoseQuickAdd />
        </Card>
      )}
    </>
  );
}
