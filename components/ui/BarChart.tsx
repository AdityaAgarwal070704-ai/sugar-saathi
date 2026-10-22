export type Bar = { label: string; value: number; sub?: string };

// Simple SVG column chart with an optional goal line. No chart library.
export function BarChart({ bars, goal, unit = "g", height = 140, ariaLabel }: { bars: Bar[]; goal?: number; unit?: string; height?: number; ariaLabel: string }) {
  const W = 340;
  const H = height;
  const pad = { l: 30, r: 6, t: 12, b: 22 };
  const max = Math.max(goal ?? 0, ...bars.map((b) => b.value), 10) * 1.15;
  const bw = (W - pad.l - pad.r) / bars.length;
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={ariaLabel}>
      {goal !== undefined && (
        <g>
          <line x1={pad.l} x2={W - pad.r} y1={y(goal)} y2={y(goal)} stroke="#1b4d3e" strokeDasharray="4 4" strokeWidth="1.5" />
          <text x={pad.l - 4} y={y(goal) + 3} textAnchor="end" style={{ font: "9px var(--font-dm-sans)", fill: "#5b6b61" }}>{goal}</text>
        </g>
      )}
      {bars.map((b, i) => {
        const over = goal !== undefined && b.value > goal * 1.2;
        const x = pad.l + i * bw + bw * 0.18;
        const w = bw * 0.64;
        return (
          <g key={b.label + i}>
            <rect x={x} y={y(b.value)} width={w} height={Math.max(0, H - pad.b - y(b.value))} rx="4" fill={b.value === 0 ? "#f2e9da" : over ? "#a63f29" : "#e9a23b"} />
            {b.value > 0 && bars.length <= 14 && <text x={x + w / 2} y={y(b.value) - 3} textAnchor="middle" style={{ font: "600 9px var(--font-dm-sans)", fill: "#1f2a24" }}>{Math.round(b.value)}</text>}
            {(bars.length <= 10 || i % Math.ceil(bars.length / 8) === 0) && <text x={x + w / 2} y={H - 7} textAnchor="middle" style={{ font: "9px var(--font-dm-sans)", fill: "#5b6b61" }}>{b.label}</text>}
          </g>
        );
      })}
      <text x={W - pad.r} y={10} textAnchor="end" style={{ font: "9px var(--font-dm-sans)", fill: "#5b6b61" }}>{unit}</text>
    </svg>
  );
}
