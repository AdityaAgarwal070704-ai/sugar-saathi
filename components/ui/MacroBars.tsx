"use client";

import { useT } from "@/lib/useT";

type Row = { label: string; grams: number; max: number; color: string };

export function MacroBars({ carbs, protein, fibre, fat, carbGoal }: { carbs: number; protein: number; fibre: number; fat: number; carbGoal: number }) {
  const { t } = useT();
  const rows: Row[] = [
    { label: t("macro.carbs"), grams: carbs, max: Math.max(carbGoal * 1.4, carbs), color: "#e9a23b" },
    { label: t("macro.protein"), grams: protein, max: Math.max(40, protein), color: "#1b4d3e" },
    { label: t("macro.fibre"), grams: fibre, max: Math.max(15, fibre), color: "#276b44" },
    { label: t("macro.fat"), grams: fat, max: Math.max(40, fat), color: "#a63f29" },
  ];
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[4.5rem_1fr_3.5rem] items-center gap-3 text-sm">
          <span className="text-muted">{r.label}</span>
          <span className="h-2.5 overflow-hidden rounded-full bg-sand" role="img" aria-label={`${r.label} ${r.grams} ${t("macro.g")}`}>
            <span className="block h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (r.grams / r.max) * 100)}%`, background: r.color }} />
          </span>
          <span className="tabular text-right font-semibold">{r.grams} {t("macro.g")}</span>
        </li>
      ))}
    </ul>
  );
}
