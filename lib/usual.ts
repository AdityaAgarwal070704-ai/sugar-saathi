import type { MealRow, SavedItem } from "./types";

export type UsualMeal = { id: string; text: string; count: number; items: SavedItem[] };

const norm = (t: string) => t.trim().toLowerCase().replace(/\s+/g, " ");

// "Your usual": meals you log repeatedly (most frequent first), topped up with your most recent distinct meals.
// `id` is the most recent meal of that kind, so the Log screen can start from it.
export function usualMeals(meals: MealRow[], limit = 4): UsualMeal[] {
  const groups = new Map<string, UsualMeal & { latest: string }>();
  for (const m of meals) {
    if (m.items.length === 0) continue;
    const k = norm(m.text);
    const g = groups.get(k);
    if (!g) groups.set(k, { id: m.id, text: m.text, count: 1, items: m.items, latest: m.eaten_at });
    else {
      g.count++;
      if (m.eaten_at > g.latest) Object.assign(g, { id: m.id, text: m.text, items: m.items, latest: m.eaten_at });
    }
  }
  const all = [...groups.values()];
  const frequent = all.filter((g) => g.count >= 2).sort((a, b) => b.count - a.count || b.latest.localeCompare(a.latest));
  const recent = all.filter((g) => g.count < 2).sort((a, b) => b.latest.localeCompare(a.latest));
  return [...frequent, ...recent].slice(0, limit).map((g) => ({ id: g.id, text: g.text, count: g.count, items: g.items }));
}
