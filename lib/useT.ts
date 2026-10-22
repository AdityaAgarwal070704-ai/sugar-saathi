"use client";

import { useMemo } from "react";
import { foodName, tFor, type Lang, type T } from "./i18n";
import { useStore } from "./store";
import type { Food } from "./types";

// Translation helpers for the current language (stored with the user's settings).
export function useT(): { t: T; lang: Lang; name: (f: Pick<Food, "name" | "hi">) => string } {
  const { profile } = useStore();
  const lang: Lang = profile.language;
  return useMemo(() => ({ t: tFor(lang), lang, name: (f) => foodName(f, lang) }), [lang]);
}
