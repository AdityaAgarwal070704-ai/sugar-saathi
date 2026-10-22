import LogMeal from "@/components/LogMeal";
import { aiUsedToday } from "@/lib/data";
import { requireUser } from "@/lib/session";

export default async function LogPage() {
  const { supabase, profile } = await requireUser();
  const used = await aiUsedToday(supabase, "parse");
  return (
    <>
      <h1 className="text-2xl font-bold">Log a meal</h1>
      <LogMeal profile={{ plan: profile?.plan ?? "free", meal_carb_target: profile?.meal_carb_target ?? 60 }} usedToday={used} />
    </>
  );
}
