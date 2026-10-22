"use client";

import { store, useStore } from "@/lib/store";
import type { Lang } from "@/lib/i18n";

// English | हिन्दी. The choice is saved with the user's settings in this browser.
export default function LanguageToggle() {
  const { profile } = useStore();
  const set = (language: Lang) => {
    if (language !== profile.language) store.setProfile({ ...profile, language });
  };
  return (
    <div className="inline-flex rounded-full border border-line bg-paper p-0.5 text-sm print:hidden" role="group" aria-label="Language / भाषा">
      {([["en", "EN"], ["hi", "हिन्दी"]] as const).map(([v, label]) => (
        <button key={v} type="button" onClick={() => set(v)} aria-pressed={profile.language === v} lang={v} className={`min-h-9 rounded-full px-3 font-medium ${profile.language === v ? "bg-moss text-white" : "text-ink hover:bg-sand"}`}>{label}</button>
      ))}
    </div>
  );
}
