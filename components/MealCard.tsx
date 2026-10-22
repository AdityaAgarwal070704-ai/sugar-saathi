"use client";

import Link from "next/link";
import { Pill } from "@/components/ui/Pill";
import { glycemicImpact } from "@/lib/impact";
import { MEAL_EMOJI } from "@/lib/meal";
import { useT } from "@/lib/useT";
import type { EnrichedMeal } from "@/lib/enrich";
import type { PairedMeal } from "@/lib/pairing";
import type { Food } from "@/lib/types";

const IMPACT_TONE = { low: "good", medium: "warn", high: "high" } as const;

// A compact summary of one logged meal: dish emojis, macros, glycemic impact and glucose chips.
export default function MealCard({ meal, foods, showDate = false }: { meal: PairedMeal<EnrichedMeal>; foods: Food[]; showDate?: boolean }) {
  const { t } = useT();
  const level = glycemicImpact(meal.gl);
  const icons = [...new Set(meal.items.map((i) => foods.find((f) => f.id === i.foodId)?.icon).filter(Boolean))].slice(0, 6);
  const when = new Date(meal.eaten_at).toLocaleString("en-IN", showDate ? { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" } : { hour: "numeric", minute: "2-digit" });
  return (
    <Link href={`/app/meal/${meal.id}`} className="block rounded-3xl border border-line bg-paper p-4 shadow-soft transition hover:shadow-lift">
      <p className="text-xl tracking-wide" aria-hidden="true">{icons.join(" ")}</p>
      <p className="mt-1 text-xs text-muted">{MEAL_EMOJI[meal.meal_type]} {t(`slot.${meal.meal_type}` as const)} · {when}</p>
      <p className="mt-0.5 font-medium leading-snug">{meal.text}</p>
      <p className="tabular mt-2 text-sm text-muted">
        <strong className="text-ink">{meal.carbs} g</strong> {t("macro.carbs")} · {meal.protein} g {t("macro.protein")} · {meal.fibre} g {t("macro.fibre")} · {meal.fat} g {t("macro.fat")} · {meal.kcal} {t("macro.kcal")}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Pill tone={IMPACT_TONE[level]}>{t(`today.impact.${level}` as const)}</Pill>
        {meal.pre && <Pill>{t("today.before", { n: meal.pre.value })}</Pill>}
        {meal.post && <Pill>{t("today.after2h", { n: meal.post.value })}</Pill>}
        {meal.rise !== null && <Pill tone={meal.rise > 60 ? "high" : meal.rise > 30 ? "warn" : "good"}>{meal.rise > 0 ? "+" : ""}{meal.rise} mg/dL</Pill>}
      </div>
    </Link>
  );
}
