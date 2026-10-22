"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { MAX_GLUCOSE, MIN_GLUCOSE, parseReading } from "@/lib/glucose";
import { useT } from "@/lib/useT";
import { rangeAlert, type RangeAlert } from "@/lib/safety";
import { store, useStore } from "@/lib/store";
import { nowMs } from "@/lib/time";

const localInput = (ms: number) => {
  const d = new Date(ms);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

// Add one glucose reading. `compact` hides the date and time box (the time is then `defaultTime` or now).
export default function GlucoseQuickAdd({ compact = false, defaultTime, label, onSaved }: { compact?: boolean; defaultTime?: string; label?: string; onSaved?: (value: number) => void }) {
  const [value, setValue] = useState("");
  const [time, setTime] = useState(defaultTime ?? localInput(nowMs()));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [alert, setAlert] = useState<RangeAlert | null>(null);
  const { profile } = useStore();
  const { t } = useT();

  const save = () => {
    setSaved(false);
    setAlert(null);
    const parsed = parseReading(value);
    if (!parsed.ok) return setError(parsed.code === "empty" ? t("glu.errEmpty") : parsed.code === "nan" ? t("glu.errNan") : t("glu.errRange", { lo: MIN_GLUCOSE, hi: MAX_GLUCOSE }));
    const when = new Date(compact && !defaultTime ? Date.now() : time);
    if (Number.isNaN(when.getTime())) return setError(t("log.errTime"));
    if (when.getTime() > Date.now() + 5 * 60_000) return setError(t("log.errFuture"));
    const { added, saved: ok } = store.addReadings([{ measured_at: when.toISOString(), value: parsed.value, source: "manual" }]);
    if (!ok) return setError(t("log.errStorage"));
    if (added === 0) return setError(t("glu.errDup"));
    setError(null);
    setValue("");
    setSaved(true);
    setAlert(rangeAlert(parsed.value, profile, t));
    onSaved?.(parsed.value);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <input inputMode="numeric" placeholder="mg/dL" aria-label={t("glu.aria")} value={value} onChange={(e) => setValue(e.target.value)} className="tabular min-h-11 w-28 rounded-2xl border border-line bg-cream px-3 text-lg font-semibold" />
        {!compact && <input type="datetime-local" aria-label="When" value={time} onChange={(e) => setTime(e.target.value)} className="min-h-11 rounded-2xl border border-line bg-cream px-3" />}
        <Button size="sm" variant="soft" onClick={save}>{label ?? t("glu.save")}</Button>
      </div>
      {error && <p role="alert" className="text-sm text-terracotta">{error}</p>}
      {saved && !alert && <p className="text-sm text-leaf">{t("common.saved")}</p>}
      {alert && (
        <div role="alert" className="rounded-2xl bg-terracotta-soft px-4 py-3 text-sm">
          <p className="font-semibold">{t("common.saved")} {alert.title}</p>
          <p className="mt-1">{alert.body}</p>
        </div>
      )}
    </div>
  );
}
