import type { Reminders } from "./types";

// Builds an .ics calendar file with daily repeating reminders. The user's own phone calendar then sounds the alerts,
// so no server or push notifications are needed. Times are "floating" local times.
const pad = (n: number) => String(n).padStart(2, "0");

function fmtLocal(d: Date) {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}
function fmtUtc(d: Date) {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

function at(base: Date, hhmm: string, plusMin = 0): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m + plusMin, 0, 0);
  return d;
}

export type IcsEvent = { uid: string; title: string; start: Date; minutes: number; note: string };

export function remindersToEvents(r: Reminders, today: Date): IcsEvent[] {
  const slots: [string, string | null][] = [["breakfast", r.breakfast], ["lunch", r.lunch], ["snack", r.snack], ["dinner", r.dinner]];
  const events: IcsEvent[] = [];
  for (const [name, time] of slots) {
    if (!time) continue;
    events.push({ uid: `log-${name}`, title: `Log your ${name} in Sugar Saathi`, start: at(today, time), minutes: 15, note: "Say it, type it or snap it. It only takes a few seconds." });
    if (r.walks) events.push({ uid: `walk-${name}`, title: "10-minute walk after your meal", start: at(today, time, 20), minutes: 10, note: "A short walk after eating is a habit many people find helpful. Ask your doctor what suits you." });
    if (r.checks) events.push({ uid: `check-${name}`, title: `Check your sugar (2 hours after ${name})`, start: at(today, time, 120), minutes: 10, note: "Add the reading in Sugar Saathi to see what the meal did to you." });
  }
  return events;
}

export function buildIcs(r: Reminders, today: Date, now: Date = new Date()): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Sugar Saathi//Daily rhythm//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:Sugar Saathi"];
  for (const e of remindersToEvents(r, today)) {
    const end = new Date(e.start.getTime() + e.minutes * 60_000);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}@sugar-saathi.vercel.app`,
      `DTSTAMP:${fmtUtc(now)}`,
      `DTSTART:${fmtLocal(e.start)}`,
      `DTEND:${fmtLocal(end)}`,
      "RRULE:FREQ=DAILY",
      `SUMMARY:${esc(e.title)}`,
      `DESCRIPTION:${esc(e.note)}`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${esc(e.title)}`,
      "TRIGGER:PT0M",
      "END:VALARM",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
