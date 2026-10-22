// Donut of where the calories come from (carbs, protein, fat), with total calories in the middle.
const COLORS = { carbs: "#e9a23b", protein: "#1b4d3e", fat: "#b84a32" };
const COLORS_DARK = { carbs: "#f2b95c", protein: "#8fd0a6", fat: "#ee8a72" }; // lighter, for dark backgrounds

export function MacroRing({ carbs, protein, fat, kcal, size = 132, onDark = false }: { carbs: number; protein: number; fat: number; kcal: number; size?: number; onDark?: boolean }) {
  const palette = onDark ? COLORS_DARK : COLORS;
  const parts = [
    { key: "carbs", kcal: carbs * 4 },
    { key: "protein", kcal: protein * 4 },
    { key: "fat", kcal: fat * 9 },
  ] as const;
  const total = parts.reduce((a, p) => a + p.kcal, 0);
  const r = 46;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="inline-flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={`${kcal} calories: ${carbs} g carbs, ${protein} g protein, ${fat} g fat`}>
        <circle cx="60" cy="60" r={r} fill="none" stroke={onDark ? "rgba(255,255,255,0.18)" : "#f2e9da"} strokeWidth="14" />
        {total > 0 &&
          parts.map((p) => {
            const len = (p.kcal / total) * c;
            const el = (
              <circle key={p.key} cx="60" cy="60" r={r} fill="none" stroke={palette[p.key]} strokeWidth="14" strokeDasharray={`${Math.max(len - 1.5, 0)} ${c - Math.max(len - 1.5, 0)}`} strokeDashoffset={-offset} transform="rotate(-90 60 60)" />
            );
            offset += len;
            return el;
          })}
        <text x="60" y="58" textAnchor="middle" className="tabular" style={{ font: "700 22px var(--font-dm-sans), sans-serif", fill: onDark ? "#ffffff" : "#1f2a24" }}>{kcal}</text>
        <text x="60" y="74" textAnchor="middle" style={{ font: "500 10px var(--font-dm-sans), sans-serif", fill: onDark ? "rgba(255,255,255,0.75)" : "#5b6b61" }}>kcal</text>
      </svg>
      <ul className={`flex gap-3 text-xs ${onDark ? "text-white/80" : "text-muted"}`}>
        <li className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ background: palette.carbs }} />Carbs</li>
        <li className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ background: palette.protein }} />Protein</li>
        <li className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ background: palette.fat }} />Fat</li>
      </ul>
    </div>
  );
}
