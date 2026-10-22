// Parses a glucose CSV export (LibreView-style or similar) into readings.
// Runs in the browser so dates are read in the user's own time zone.

export type ParsedReading = { measured_at: string; value: number };
export type CsvResult = { readings: ParsedReading[]; skipped: number; unit: "mg/dL" | "mmol/L"; error?: string };

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === "," || ch === ";" || ch === "\t") {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

const DATE_RE = /^(\d{1,4})[-/.](\d{1,2})[-/.](\d{1,4})(?:[ T,]+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?/i;

type DateOrder = "dmy" | "mdy" | "ymd";

function detectOrder(samples: string[]): DateOrder {
  let dmy = false;
  let mdy = false;
  for (const s of samples) {
    const m = DATE_RE.exec(s);
    if (!m) continue;
    if (m[1].length === 4) return "ymd";
    if (Number(m[1]) > 12) dmy = true;
    if (Number(m[2]) > 12) mdy = true;
  }
  if (mdy && !dmy) return "mdy";
  return "dmy"; // default for India
}

function parseDate(s: string, order: DateOrder): Date | null {
  const m = DATE_RE.exec(s.trim());
  if (!m) {
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  let y: number, mo: number, d: number;
  if (order === "ymd") [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  else if (order === "mdy") [mo, d, y] = [Number(m[1]), Number(m[2]), Number(m[3])];
  else [d, mo, y] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (y < 100) y += 2000;
  let hh = m[4] ? Number(m[4]) : 0;
  const mm = m[5] ? Number(m[5]) : 0;
  const ss = m[6] ? Number(m[6]) : 0;
  const ap = m[7]?.toUpperCase();
  if (ap === "PM" && hh < 12) hh += 12;
  if (ap === "AM" && hh === 12) hh = 0;
  const date = new Date(y, mo - 1, d, hh, mm, ss);
  return Number.isNaN(date.getTime()) || mo < 1 || mo > 12 || d < 1 || d > 31 ? null : date;
}

export function parseGlucoseCsv(text: string): CsvResult {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim() !== "");
  const empty = (error: string): CsvResult => ({ readings: [], skipped: 0, unit: "mg/dL", error });

  // Find the header row: has a time-like column and a glucose-like column.
  let headerIdx = -1;
  let cols: string[] = [];
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const c = splitCsvLine(lines[i]).map((x) => x.toLowerCase());
    if (c.some((x) => /time|date/.test(x)) && c.some((x) => /glucose|mg\/dl|mmol/.test(x))) {
      headerIdx = i;
      cols = c;
      break;
    }
  }
  if (headerIdx === -1) return empty("I couldn't find a time column and a glucose column in this file.");

  const timeCol = cols.findIndex((x) => /timestamp|time|date/.test(x));
  const glucoseCols = cols.map((x, i) => (/glucose|mg\/dl|mmol/.test(x) && !/ketone|insulin|carb|food/.test(x) ? i : -1)).filter((i) => i >= 0);
  if (timeCol === -1 || glucoseCols.length === 0) return empty("I couldn't find a time column and a glucose column in this file.");
  const headerSaysMmol = glucoseCols.some((i) => /mmol/.test(cols[i]));

  const rows = lines.slice(headerIdx + 1).map(splitCsvLine);
  const order = detectOrder(rows.slice(0, 200).map((r) => r[timeCol] ?? ""));

  const raw: { date: Date; value: number }[] = [];
  let skipped = 0;
  for (const r of rows) {
    const date = parseDate(r[timeCol] ?? "", order);
    let value: number | null = null;
    for (const gi of glucoseCols) {
      const v = Number((r[gi] ?? "").replace(",", "."));
      if ((r[gi] ?? "") !== "" && Number.isFinite(v)) {
        value = v;
        break;
      }
    }
    if (!date || value === null) {
      skipped++;
      continue;
    }
    raw.push({ date, value });
  }

  const mmol = headerSaysMmol || (raw.length > 0 && raw.every((x) => x.value < 35));
  const readings: ParsedReading[] = [];
  for (const { date, value } of raw) {
    const mg = Math.round(mmol ? value * 18.0182 : value);
    if (mg < 40 || mg > 600) {
      skipped++;
      continue;
    }
    readings.push({ measured_at: date.toISOString(), value: mg });
  }
  return { readings, skipped, unit: mmol ? "mmol/L" : "mg/dL" };
}
