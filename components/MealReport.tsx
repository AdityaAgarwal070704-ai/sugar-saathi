"use client";

import TipsCard from "@/components/TipsCard";
import { Card } from "@/components/ui/Card";
import { GlycemicGauge } from "@/components/ui/GlycemicGauge";
import { MacroBars } from "@/components/ui/MacroBars";
import { MacroRing } from "@/components/ui/MacroRing";
import { PlateBalance } from "@/components/ui/PlateBalance";
import { nutritionOf } from "@/lib/carbs";
import { plateGroups } from "@/lib/impact";
import { mealTips } from "@/lib/insights";
import type { PairedMeal } from "@/lib/pairing";
import { expectedRise } from "@/lib/response";
import { useT } from "@/lib/useT";
import type { Food, MealRow, MealType, Profile, SavedItem } from "@/lib/types";

type Props = {
  items: Pick<SavedItem, "foodId" | "count">[];
  mealType: MealType;
  foods: Food[];
  profile: Profile;
  history: PairedMeal<MealRow>[]; // the user's other meals, for "expected change"
  mealId?: string;
};

// The full report for one meal: macros, glycemic impact, plate balance, expected change in the user's sugar, tips.
export default function MealReport({ items, mealType, foods, profile, history, mealId }: Props) {
  const { t, lang } = useT();
  const n = nutritionOf(items, foods);
  const tips = mealTips(items, foods, profile, { t, lang });
  const groups = plateGroups(items, foods);
  const expected = expectedRise({ carbs: n.carbs, meal_type: mealType, id: mealId }, history);

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="font-display text-xl font-semibold">{t("report.nutrition")}</h2>
        <p className="mt-1 text-sm text-muted">{tips.headline}</p>
        <div className="mt-4 grid items-center gap-5 sm:grid-cols-[auto_1fr]">
          <div className="flex justify-center"><MacroRing carbs={n.carbs} protein={n.protein} fat={n.fat} kcal={n.kcal} /></div>
          <MacroBars carbs={n.carbs} protein={n.protein} fibre={n.fibre} fat={n.fat} carbGoal={profile.meal_carb_target} />
        </div>
      </Card>

      <Card>
        <GlycemicGauge gl={n.gl} />
        <div className="mt-5">
          <h3 className="mb-2 font-display text-lg font-semibold">{t("report.plate")}</h3>
          <PlateBalance groups={groups} />
        </div>
      </Card>

      <Card tone="saffron">
        <h2 className="font-display text-xl font-semibold">{t("report.expected")}</h2>
        {expected.status === "ok" ? (
          <>
            <p className="tabular mt-2 text-3xl font-bold">
              {expected.low >= 0 ? "+" : ""}{expected.low} to {expected.high >= 0 ? "+" : ""}{expected.high} <span className="text-lg font-medium">mg/dL</span>
            </p>
            <p className="mt-1 text-sm">
              {t("report.okBody", { median: `${expected.median >= 0 ? "+" : ""}${expected.median}`, n: expected.n, kind: expected.sameMealType ? t("report.kindType", { type: t(`slot.${mealType}` as const).toLowerCase() }) : t("report.kindMeals") })}
            </p>
            <p className="mt-2 text-xs text-muted">{t("report.okNote")}</p>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm">{t("report.insufficient", { found: expected.found, needed: expected.needed })}</p>
            <p className="mt-2 text-sm text-muted">{t("report.insufficientHow")}</p>
          </>
        )}
      </Card>

      <Card>
        <TipsCard tips={tips} />
      </Card>
    </div>
  );
}
