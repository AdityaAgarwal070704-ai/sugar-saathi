"use client";

export function Stepper({ value, onChange, step = 0.5, min = 0.5, max = 20, label }: { value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number; label: string }) {
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v * 100) / 100));
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-paper" role="group" aria-label={label}>
      <button type="button" aria-label="Less" disabled={value <= min} onClick={() => onChange(clamp(value - step))} className="h-11 w-11 rounded-full text-xl text-moss hover:bg-moss-soft disabled:opacity-30">−</button>
      <span className="tabular min-w-12 text-center text-lg font-semibold" aria-live="polite">{value}</span>
      <button type="button" aria-label="More" disabled={value >= max} onClick={() => onChange(clamp(value + step))} className="h-11 w-11 rounded-full text-xl text-moss hover:bg-moss-soft disabled:opacity-30">+</button>
    </div>
  );
}
