"use client";

import Link from "next/link";
import CompareDishes from "@/components/CompareDishes";
import { Card } from "@/components/ui/Card";
import { useFoods } from "@/lib/useFoods";

export default function EatingOut() {
  const foods = useFoods();
  const f = (id: string) => foods.find((x) => x.id === id);
  const g = (id: string) => f(id)?.carbs ?? 0;
  const dishes = foods.filter((x) => x.tags.includes("restaurant")).sort((a, b) => a.carbs - b.carbs);

  const TIPS = [
    { icon: "🫓", title: "Roti over naan", body: `One naan has about ${g("naan")} g of carbs; a roti has about ${g("roti")} g. Tandoori roti (${g("tandoori_roti")} g) and roti are the lighter choices.` },
    { icon: "🍗", title: "Grilled starters", body: `Tikka and tandoori dishes (about ${g("chicken_tikka")} g carbs) are far lighter than fried starters or samosas (${g("samosa")} g each).` },
    { icon: "🍛", title: "Biryani is a full plate", body: `A katori of veg biryani is about ${g("veg_biryani")} g carbs, and a plate is often 2 to 3 katori. Share a portion, and add raita and a salad.` },
    { icon: "🥗", title: "Ask for dal, sabzi or salad", body: "A side of dal, a dry sabzi or a salad adds fibre and protein to the same plate of bread or rice." },
    { icon: "🥤", title: "Sweet drinks add up", body: `A sweet lassi is about ${g("lassi_sweet")} g carbs and a soft drink about ${g("cola")} g. Chaas (${g("chaas")} g) or plain water cost almost nothing.` },
    { icon: "🍨", title: "Share dessert", body: `A gulab jamun is about ${g("gulab_jamun")} g carbs. One piece to share is plenty for most people.` },
  ];

  return (
    <>
      <div>
        <Link href="/app/discover" className="inline-block py-2 text-sm font-medium text-moss underline">← Discover</Link>
        <h1 className="mt-2 font-display text-3xl font-semibold">Eating out</h1>
        <p className="mt-1 text-muted">Restaurant and delivery meals, without the guesswork.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {TIPS.map((t) => (
          <Card key={t.title} className="!p-4">
            <p className="text-2xl" aria-hidden="true">{t.icon}</p>
            <h2 className="mt-1 font-display text-lg font-semibold">{t.title}</h2>
            <p className="mt-1 text-sm text-muted">{t.body}</p>
          </Card>
        ))}
      </div>

      <CompareDishes />

      <Card>
        <h2 className="font-display text-xl font-semibold">Restaurant dishes, lightest first</h2>
        <p className="mb-2 text-sm text-muted">Carbs per portion. Tap a dish name in the log screen to use it; these are the same dishes.</p>
        <ul className="divide-y divide-line text-sm">
          {dishes.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 py-2">
              <span><span aria-hidden="true">{d.icon}</span> {d.name} <span className="text-muted">per {d.unit}</span></span>
              <span className="tabular shrink-0 font-semibold">{d.carbs} g <span className="font-normal text-muted">· {d.protein} g protein</span></span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">Restaurant portions and recipes vary a lot. These are rough, unverified estimates, so use them to compare, not to count exactly.</p>
      </Card>
    </>
  );
}
