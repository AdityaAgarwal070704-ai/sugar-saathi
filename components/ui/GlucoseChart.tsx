export type ChartPoint = { t: number; v: number };
export type ChartMarker = { t: number; label: string };

const W = 340;
const H = 150;
const PAD = { l: 34, r: 10, t: 14, b: 24 };

export function GlucoseChart({ points, low, high, markers = [], ariaLabel = "Glucose chart" }: { points: ChartPoint[]; low: number; high: number; markers?: ChartMarker[]; ariaLabel?: string }) {
  if (points.length === 0) return null;
  const ts = [...points.map((p) => p.t), ...markers.map((m) => m.t)];
  let t0 = Math.min(...ts);
  let t1 = Math.max(...ts);
  if (t1 - t0 < 30 * 60_000) {
    t0 -= 15 * 60_000;
    t1 += 15 * 60_000;
  }
  const vMin = Math.min(...points.map((p) => p.v), low) - 10;
  const vMax = Math.max(...points.map((p) => p.v), high) + 10;
  const x = (t: number) => PAD.l + ((t - t0) / (t1 - t0)) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - (v - vMin) / (vMax - vMin)) * (H - PAD.t - PAD.b);
  const sorted = [...points].sort((a, b) => a.t - b.t);
  const path = sorted.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.t).toFixed(1)} ${y(p.v).toFixed(1)}`).join(" ");
  const fmt = (t: number) => new Date(t).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={ariaLabel}>
      <rect x={PAD.l} y={y(high)} width={W - PAD.l - PAD.r} height={Math.max(0, y(low) - y(high))} fill="#e3efe7" />
      <text x={PAD.l - 6} y={y(high) + 4} textAnchor="end" style={{ font: "10px var(--font-dm-sans)", fill: "#5b6b61" }}>{high}</text>
      <text x={PAD.l - 6} y={y(low) + 4} textAnchor="end" style={{ font: "10px var(--font-dm-sans)", fill: "#5b6b61" }}>{low}</text>
      {markers.map((m, i) => (
        <g key={`${m.t}-${m.label}-${i}`}>
          <line x1={x(m.t)} x2={x(m.t)} y1={PAD.t} y2={H - PAD.b} stroke="#e9a23b" strokeWidth="2" strokeDasharray="4 3" />
          <text x={x(m.t) + 4} y={PAD.t + 8} style={{ font: "600 10px var(--font-dm-sans)", fill: "#7a4f08" }}>{m.label}</text>
        </g>
      ))}
      {sorted.length > 1 && <path d={path} fill="none" stroke="#1b4d3e" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
      {sorted.map((p, i) => (
        <g key={`${p.t}-${p.v}-${i}`}>
          <circle cx={x(p.t)} cy={y(p.v)} r="4.5" fill="#1b4d3e" stroke="#fffdf9" strokeWidth="2" />
          <text x={x(p.t)} y={y(p.v) - 9} textAnchor="middle" style={{ font: "600 10px var(--font-dm-sans)", fill: "#1f2a24" }}>{p.v}</text>
        </g>
      ))}
      <text x={PAD.l} y={H - 6} style={{ font: "10px var(--font-dm-sans)", fill: "#5b6b61" }}>{fmt(t0)}</text>
      <text x={W - PAD.r} y={H - 6} textAnchor="end" style={{ font: "10px var(--font-dm-sans)", fill: "#5b6b61" }}>{fmt(t1)}</text>
    </svg>
  );
}
