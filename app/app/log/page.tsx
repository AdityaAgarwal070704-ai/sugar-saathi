import LogMeal from "@/components/LogMeal";
import { requireUser } from "@/lib/session";

export default async function LogPage() {
  const { profile } = await requireUser();
  return (
    <>
      <h1 className="text-2xl font-bold">Log a meal</h1>
      <LogMeal profile={{ meal_carb_target: profile?.meal_carb_target ?? 60 }} />
    </>
  );
}
