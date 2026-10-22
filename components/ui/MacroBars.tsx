type Row = { label: string; grams: number; max: number; color: string };

export function MacroBars({ carbs, protein, fibre, fat, carbGoal }: { carbs: number; protein: number; fibre: number; fat: number; carbGoal: number }) {
  const rows: Row[] = [
    { label: "Carbs", grams: carbs, max: Math.max(carbGoal * 1.4, carbs), color: "#e9a23b" },
    { label: "Protein", grams: protein, max: Math.max(40, protein), color: "#1b4d3e" },
    { label: "Fibre", grams: fibre, max: Math.max(15, fibre), color: "#2f7d4f" },
    { label: "Fat", grams: fat, max: Math.max(40, fat), color: "#b84a32" },
  ];
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[4.5rem_1fr_3.5rem] items-center gap-3 text-sm">
          <span className="text-muted">{r.label}</span>
          <span className="h-2.5 overflow-hidden rounded-full bg-sand" role="img" aria-label={`${r.label} ${r.grams} grams`}>
            <span className="block h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (r.grams / r.max) * 100)}%`, background: r.color }} />
          </span>
          <span className="tabular text-right font-semibold">{r.grams} g</span>
        </li>
      ))}
    </ul>
  );
}
