"use client";

import MealCard from "@/components/MealCard";
import ProgressTabs from "@/components/ProgressTabs";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useRecent } from "@/lib/useRecent";

export default function History() {
  const { ready, paired, foods: FOODS } = useRecent(3650);
  if (!ready) return <p className="text-muted">Loading…</p>;

  const groups = new Map<string, typeof paired>();
  for (const m of paired) {
    const k = new Date(m.eaten_at).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
    groups.set(k, [...(groups.get(k) ?? []), m]);
  }

  return (
    <>
      <h1 className="font-display text-3xl font-semibold">Progress</h1>
      <ProgressTabs />
      {paired.length === 0 ? (
        <EmptyState title="No meals yet" action={<ButtonLink href="/app/log">Log your first meal</ButtonLink>}>
          Every meal you log appears here with its nutrition and glucose.
        </EmptyState>
      ) : (
        [...groups.entries()].map(([day, ms]) => (
          <section key={day} className="space-y-2">
            <h2 className="font-display text-lg font-semibold text-muted">{day}</h2>
            <div className="grid gap-3 md:grid-cols-2">{ms.map((m) => <MealCard key={m.id} meal={m} foods={FOODS} />)}</div>
          </section>
        ))
      )}
    </>
  );
}
