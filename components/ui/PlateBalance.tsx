import type { PlateGroups } from "@/lib/impact";

const ITEMS = [
  { key: "veg", label: "Vegetables", icon: "🥗" },
  { key: "dal", label: "Dal / legumes", icon: "🫘" },
  { key: "protein", label: "Protein", icon: "🥚" },
  { key: "grain", label: "Roti / rice", icon: "🌾" },
] as const;

export function PlateBalance({ groups }: { groups: PlateGroups }) {
  return (
    <div>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ITEMS.map((i) => {
          const on = groups[i.key];
          return (
            <li key={i.key} className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm ${on ? "bg-moss-soft text-moss" : "border border-dashed border-line text-muted"}`}>
              <span aria-hidden="true">{i.icon}</span>
              <span>{i.label}</span>
              <span className="sr-only">{on ? "included" : "missing"}</span>
              {on && <span className="ml-auto text-xs" aria-hidden="true">✓</span>}
            </li>
          );
        })}
      </ul>
      {groups.grain && <p className="mt-2 text-xs text-muted">About {Math.round(groups.grainShare * 100)}% of this meal&apos;s carbs come from roti, rice or other grains.</p>}
    </div>
  );
}
