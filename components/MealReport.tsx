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
  const n = nutritionOf(items, foods);
  const tips = mealTips(items, foods, profile);
  const groups = plateGroups(items, foods);
  const expected = expectedRise({ carbs: n.carbs, meal_type: mealType, id: mealId }, history);

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="font-display text-xl font-semibold">Nutrition</h2>
        <p className="mt-1 text-sm text-muted">{tips.headline}</p>
        <div className="mt-4 grid items-center gap-5 sm:grid-cols-[auto_1fr]">
          <div className="flex justify-center"><MacroRing carbs={n.carbs} protein={n.protein} fat={n.fat} kcal={n.kcal} /></div>
          <MacroBars carbs={n.carbs} protein={n.protein} fibre={n.fibre} fat={n.fat} carbGoal={profile.meal_carb_target} />
        </div>
      </Card>

      <Card>
        <GlycemicGauge gl={n.gl} />
        <div className="mt-5">
          <h3 className="mb-2 font-display text-lg font-semibold">Plate balance</h3>
          <PlateBalance groups={groups} />
        </div>
      </Card>

      <Card tone="saffron">
        <h2 className="font-display text-xl font-semibold">Expected change in your sugar</h2>
        {expected.status === "ok" ? (
          <>
            <p className="tabular mt-2 text-3xl font-bold">
              {expected.low >= 0 ? "+" : ""}{expected.low} to {expected.high >= 0 ? "+" : ""}{expected.high} <span className="text-lg font-medium">mg/dL</span>
            </p>
            <p className="mt-1 text-sm">
              Meals like this have raised your sugar by about this much (typically {expected.median >= 0 ? "+" : ""}{expected.median}). Based on {expected.n} of your own similar {expected.sameMealType ? `${mealType} meals` : "meals"} with before and 2-hour readings.
            </p>
            <p className="mt-2 text-xs text-muted">This comes from your own history, not a prediction. Activity, sleep, stress and illness all change the result.</p>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm">
              Not enough of your own readings yet to say how a meal like this affects you ({expected.found} of {expected.needed} similar meals with a 2-hour reading).
            </p>
            <p className="mt-2 text-sm text-muted">Add a reading before eating and another 2 hours later. After a few meals this card shows a personal range, learned only from your data.</p>
          </>
        )}
      </Card>

      <Card>
        <TipsCard tips={tips} />
      </Card>
    </div>
  );
}
