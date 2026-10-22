"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { fill, LESSONS } from "@/lib/learn";
import { useFoods } from "@/lib/useFoods";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/useT";

export default function Learn() {
  const { ready } = useStore();
  const { lang, t } = useT();
  const foods = useFoods();
  if (!ready) return <p className="text-muted">{t("common.loading")}</p>;
  const hi = lang === "hi";

  return (
    <>
      <div>
        <Link href="/app/discover" className="inline-block py-2 text-sm font-medium text-moss underline">← {t("nav.discover")}</Link>
        <h1 className="mt-2 font-display text-3xl font-semibold">{hi ? "सीखें" : "Learn"}</h1>
        <p className="mt-1 text-muted">{hi ? "रोज़ की ज़िंदगी के लिए छोटे, व्यावहारिक पाठ।" : "Short, practical lessons for everyday life with diabetes."}</p>
      </div>

      <div className="space-y-3">
        {LESSONS.map((l) => (
          <details key={l.id} className="group rounded-3xl border border-line bg-paper shadow-soft">
            <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 px-5 py-3">
              <span className="text-3xl" aria-hidden="true">{l.icon}</span>
              <span className="flex-1">
                <span className="block font-display text-lg font-semibold">{l.title[lang]}</span>
                <span className="block text-sm text-muted">{l.intro[lang]}</span>
              </span>
              <span className="text-xl text-moss transition group-open:rotate-45" aria-hidden="true">+</span>
            </summary>
            <div className="space-y-3 border-t border-line px-5 py-4 text-sm">
              <ul className="list-disc space-y-1.5 pl-5">
                {l.points[lang].map((p) => <li key={p}>{fill(p, foods)}</li>)}
              </ul>
              <p className="rounded-2xl bg-moss-soft px-4 py-3"><strong>{hi ? "आज आज़माएँ:" : "Try today:"}</strong> {l.tryToday[lang]}</p>
              {l.ask && <p className="rounded-2xl bg-saffron-soft px-4 py-3"><strong>{hi ? "अपने डॉक्टर या एजुकेटर से पूछें:" : "Ask your doctor or educator:"}</strong> {l.ask[lang]}</p>}
              {l.link && <Link href={l.link.href} className="inline-block font-medium text-moss underline">{l.link.label[lang]} →</Link>}
            </div>
          </details>
        ))}
      </div>
      <Card tone="sand">
        <p className="text-xs text-muted">{hi ? "ये सामान्य जानकारी वाले पाठ हैं, चिकित्सकीय सलाह नहीं। अपने इलाज और खान-पान के बारे में अपने डॉक्टर या डायबिटीज़ एजुकेटर से बात करें। हिंदी अनुवाद नया है और इसकी समीक्षा होनी चाहिए।" : "These are general education notes, not medical advice. Talk to your doctor or diabetes educator about your own treatment and diet."}</p>
      </Card>
    </>
  );
}
