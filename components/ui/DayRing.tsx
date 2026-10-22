// A progress ring (for example today's carbs against the day's budget). Colour moves from green to saffron to terracotta
// as the budget is passed, but the wording stays neutral: it is a guide, not a score.
export function DayRing({ value, max, size = 150, unit = "g", caption }: { value: number; max: number; size?: number; unit?: string; caption: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const ratio = max > 0 ? value / max : 0;
  const color = ratio <= 1 ? "#1b4d3e" : ratio <= 1.2 ? "#e9a23b" : "#b84a32";
  return (
    <svg width={size} height={size} viewBox="0 0 130 130" role="img" aria-label={`${value} ${unit} of ${max} ${unit} ${caption}`}>
      <circle cx="65" cy="65" r={r} fill="none" stroke="#f2e9da" strokeWidth="13" />
      <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="13" strokeLinecap="round" strokeDasharray={`${Math.min(ratio, 1) * c} ${c}`} transform="rotate(-90 65 65)" style={{ transition: "stroke-dasharray 0.8s ease" }} />
      <text x="65" y="63" textAnchor="middle" className="tabular" style={{ font: "700 28px var(--font-dm-sans), sans-serif", fill: "#1f2a24" }}>{value}</text>
      <text x="65" y="80" textAnchor="middle" style={{ font: "500 11px var(--font-dm-sans), sans-serif", fill: "#5b6b61" }}>of {max} {unit}</text>
    </svg>
  );
}
