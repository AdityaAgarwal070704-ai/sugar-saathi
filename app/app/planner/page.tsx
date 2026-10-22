import Planner from "@/components/Planner";
import { LockedCard } from "@/components/Upgrade";
import { requireUser } from "@/lib/session";

export default async function PlannerPage() {
  const { profile } = await requireUser();
  return (
    <>
      <h1 className="text-2xl font-bold">Meal planner</h1>
      {profile?.plan === "pro" ? (
        <Planner defaultTarget={profile.meal_carb_target} defaultDiet={profile.diet} />
      ) : (
        <LockedCard title="AI day meal planner">Get a full day of Indian meals that fits your carb goal and diet, with fibre and protein worked out for every plate.</LockedCard>
      )}
    </>
  );
}
