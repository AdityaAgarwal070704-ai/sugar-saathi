import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";

const LIVE = [
  { href: "/app/recipes", icon: "🍲", title: "My dishes", body: "Cook by feel? List your ingredients once and get nutrition for one serving of your own recipe." },
  { href: "/app/planner", icon: "🍽️", pro: true, title: "Day meal planner", body: "A full day of Indian meals that fits your carb goal and diet, with every number worked out from the food table." },
  { href: "/app/eating-out", icon: "🍛", title: "Eating out", body: "Restaurant and delivery dishes compared, with simple swaps and a side-by-side dish comparison." },
  { href: "/app/occasions", icon: "🪔", title: "Fasting and festivals", body: "Vrat, Ramzan and festival ideas, and a sweet budget that shows how many pieces fit." },
  { href: "/app/learn", icon: "📚", title: "Learn", body: "Short, practical lessons in English and Hindi: the balanced thali, roti or rice, reading labels, festivals, and what to ask your educator." },
  { href: "/app/report", icon: "📄", pro: true, title: "Educator report", body: "A clean one-page summary of your week to print, save or share before your appointment." },
  { href: "/app/glucose", icon: "🩸", title: "Glucose readings", body: "Add readings or import a CSV from your meter or CGM app, and see them beside your meals." },
];

const SOON = [
  { icon: "🌐", title: "More of the app in Hindi", body: "Hindi already covers the daily screens. Progress, Discover tools and reports are next, then other Indian languages." },
  { icon: "☁️", title: "Sync across devices", body: "Optional accounts so your data follows you from phone to phone." },
];

export default function Discover() {
  return (
    <>
      <div>
        <h1 className="font-display text-3xl font-semibold">Discover</h1>
        <p className="mt-1 text-muted">Tools to plan ahead and share with your care team.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LIVE.map((c) => (
          <Link key={c.href} href={c.href} className="block rounded-3xl border border-line bg-paper p-5 shadow-soft transition hover:shadow-lift">
            <span className="text-3xl" aria-hidden="true">{c.icon}</span>
            <h2 className="mt-2 font-display text-xl font-semibold">{c.title}{"pro" in c && c.pro ? <Pill tone="warn" className="ml-2 align-middle">Pro</Pill> : null}</h2>
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
