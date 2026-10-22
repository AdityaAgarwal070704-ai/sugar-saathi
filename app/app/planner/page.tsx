import Planner from "@/components/Planner";
import { requireUser } from "@/lib/session";

export default async function PlannerPage() {
  const { profile } = await requireUser();
  return (
    <>
      <h1 className="text-2xl font-bold">Meal planner</h1>
      {profile ? (
        <Planner defaultTarget={profile.meal_carb_target} defaultDiet={profile.diet} />
      ) : (
        <p className="text-red-700">Your profile couldn&apos;t be loaded. Run supabase/schema.sql, then sign in again.</p>
      )}
    </>
  );
}
