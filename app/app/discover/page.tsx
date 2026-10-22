import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";

const LIVE = [
  { href: "/app/planner", icon: "🍽️", title: "Day meal planner", body: "A full day of Indian meals that fits your carb goal and diet, with every number worked out from the food table." },
  { href: "/app/report", icon: "📄", title: "Educator report", body: "A clean one-page summary of your week to print or save before your appointment." },
  { href: "/app/glucose", icon: "🩸", title: "Glucose readings", body: "Add readings or import a CSV from your meter or CGM app, and see them beside your meals." },
];

const SOON = [
  { icon: "🍲", title: "Recipe builder", body: "Cook by feel? Enter your ingredients once and get per-serving nutrition for your own dishes." },
  { icon: "🪔", title: "Fasting and festival modes", body: "Vrat, Ramzan and festival-day planning with portion budgets." },
  { icon: "🍛", title: "Eating out", body: "Restaurant and delivery dishes with portion tips." },
  { icon: "📚", title: "Learn", body: "Short, practical lessons for everyday Indian life with diabetes." },
];

export default function Discover() {
  return (
    <>
      <div>
        <h1 className="font-display text-3xl font-semibold">Discover</h1>
        <p className="mt-1 text-muted">Tools to plan ahead and share with your care team.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {LIVE.map((c) => (
          <Link key={c.href} href={c.href} className="block rounded-3xl border border-line bg-paper p-5 shadow-soft transition hover:shadow-lift">
            <span className="text-3xl" aria-hidden="true">{c.icon}</span>
            <h2 className="mt-2 font-display text-xl font-semibold">{c.title}</h2>
            <p className="mt-1 text-sm text-muted">{c.body}</p>
          </Link>
        ))}
      </div>
      <h2 className="font-display text-xl font-semibold">Coming soon</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {SOON.map((c) => (
          <Card key={c.title} tone="sand">
            <div className="flex items-center justify-between">
              <span className="text-2xl" aria-hidden="true">{c.icon}</span>
              <Pill>Coming soon</Pill>
            </div>
            <h3 className="mt-2 font-display text-lg font-semibold">{c.title}</h3>
            <p className="mt-1 text-sm text-muted">{c.body}</p>
          </Card>
        ))}
      </div>
    </>
  );
}
