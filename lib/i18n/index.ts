import { en, type MessageKey, type Messages } from "./en";
import { hi } from "./hi";
import type { Food } from "../types";

export type Lang = "en" | "hi";
export type { MessageKey };
export type T = (key: MessageKey, vars?: Record<string, string | number>) => string;

const DICTS: Record<Lang, Messages> = { en, hi };

export function isLang(v: unknown): v is Lang {
  return v === "en" || v === "hi";
}

// Replaces {name} placeholders. If `n` is 1 and a "<key>_one" message exists, that one is used (singular wording).
export function translate(lang: Lang, key: MessageKey, vars?: Record<string, string | number>): string {
  const dict = DICTS[lang];
  const oneKey = `${key}_one` as MessageKey;
  const base = vars && vars.n === 1 && oneKey in dict ? dict[oneKey] : dict[key];
  const text = base ?? en[key];
  return vars ? text.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m)) : text;
}

export const tFor = (lang: Lang): T => (key, vars) => translate(lang, key, vars);
export const tEn: T = tFor("en");

// "roti" / "rotis", or the Hindi unit word.
export function unitLabel(t: T, unit: string, count: number): string {
  const k = `unit.${unit}` as MessageKey;
  const kPlural = `unit.${unit}_other` as MessageKey;
  if (!(k in en)) return unit;
  return count === 1 ? t(k) : t(kPlural);
}

// A dish's display name in the chosen language (Hindi when available).
export function foodName(f: Pick<Food, "name" | "hi">, lang: Lang): string {
  return lang === "hi" && f.hi ? f.hi : f.name;
}
