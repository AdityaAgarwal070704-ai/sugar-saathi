export const MIN_GLUCOSE = 40;
export const MAX_GLUCOSE = 600;

export type ReadingResult = { ok: true; value: number } | { ok: false; message: string; code: "empty" | "nan" | "range" };

export function parseReading(raw: string): ReadingResult {
  const text = raw.trim();
  if (text === "") return { ok: false, message: "Enter a number.", code: "empty" };
  const value = Number(text);
  if (!Number.isFinite(value)) return { ok: false, message: "That isn't a number.", code: "nan" };
  if (value < MIN_GLUCOSE || value > MAX_GLUCOSE) {
    return { ok: false, message: `Enter a value between ${MIN_GLUCOSE} and ${MAX_GLUCOSE} mg/dL.`, code: "range" };
  }
  return { ok: true, value: Math.round(value) };
}

export function rise(pre: number | null, post: number | null): number | null {
  if (pre === null || post === null) return null;
  return post - pre;
}
