"use client";

import type { PlateGroups } from "@/lib/impact";
import { useT } from "@/lib/useT";

const ITEMS = [
  { key: "veg", label: "plate.veg", icon: "🥗" },
  { key: "dal", label: "plate.dal", icon: "🫘" },
  { key: "protein", label: "plate.protein", icon: "🥚" },
  { key: "grain", label: "plate.grain", icon: "🌾" },
] as const;

export function PlateBalance({ groups }: { groups: PlateGroups }) {
  const { t } = useT();
  return (
    <div>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ITEMS.map((i) => {
          const on = groups[i.key];
          return (
            <li key={i.key} className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm ${on ? "bg-moss-soft text-moss" : "border border-dashed border-line text-muted"}`}>
              <span aria-hidden="true">{i.icon}</span>
              <span>{t(i.label)}</span>
              <span className="sr-only">{on ? t("plate.included") : t("plate.missing")}</span>
              {on && <span className="ml-auto text-xs" aria-hidden="true">✓</span>}
            </li>
          );
        })}
      </ul>
      {groups.grain && <p className="mt-2 text-xs text-muted">{t("plate.share", { n: Math.round(groups.grainShare * 100) })}</p>}
    </div>
  );
}
