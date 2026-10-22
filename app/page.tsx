import Link from "next/link";
import Disclaimer from "@/components/Disclaimer";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MacroRing } from "@/components/ui/MacroRing";
import { LogoMark } from "@/components/ui/icons";

const DAY = [
  { icon: "🌅", when: "Morning", title: "Start with a quick check-in", body: "Log your fasting reading and see today's carb budget at a glance." },
  { icon: "🍛", when: "Every meal", title: "Say it, type it or snap it", body: "\"Do roti, ek katori dal, aloo sabzi\" works. So does a photo of your plate." },
  { icon: "🚶", when: "After eating", title: "Close the loop at 2 hours", body: "Add your reading and see what that exact meal did to your sugar." },
  { icon: "📄", when: "Every week", title: "Walk into your appointment ready", body: "A clean one-page report with your meals, readings and patterns." },
];

const FEATURES = [
  ["🥗", "Carbs, protein, fibre, fat and calories", "Worked out per dish from an Indian food table with 215 dishes, in the units you actually use: roti, katori, glass."],
  ["🎯", "Glycemic impact at a glance", "A simple low, medium or high gauge for every meal, plus plate balance: vegetables, dal, protein and grains."],
  ["📈", "What meals do to you", "Add readings and Sugar Saathi learns your own pattern, then shows a range like +45 to +80 mg/dL for meals like this one."],
  ["🔄", "Swaps that save real carbs", "Brown rice for white, roti for naan, nimbu pani for cola, each with the grams saved."],
  ["🍽️", "A day meal planner", "Ideas for a full day of Indian meals within your carb goal, vegetarian or not."],
  ["🔒", "Private by design", "Your meals and readings are stored only on your own device, with backup and restore. We keep no health database."],
];

const FAQ = [
  ["Is Sugar Saathi free?", "Yes. There is a free plan forever. Every new account also gets all Pro features free for 7 days, with no card. Pro isn't on sale yet, and nothing is charged today."],
  ["What is in Free and what is in Pro?", "Free covers the daily essentials: logging, nutrition and tips, your routine, glucose entry and safety cards, Learn and more. Pro adds photo logging, your personal expected sugar change, 30-day progress, the AI weekly summary, the day planner, the educator report, sharing and CSV import."],
  ["Where is my data stored?", "Your meals, readings and goals are stored only in your own browser on your own device. We keep just your Google name and email in a sign-in cookie. Use the backup in Me to move your data or keep it safe."],
  ["Does the AI calculate my carbs?", "No. The AI only works out which dishes you ate. Every number comes from the food table and is calculated by code, so it can't invent nutrition."],
  ["Will it tell me how much insulin or medicine to take?", "Never. Sugar Saathi gives food guidance only. Questions about medicines or doses are for your doctor or diabetes educator."],
  ["How accurate are the numbers?", "They are estimates from a starter table that has not been checked by a dietitian yet, and portions are your own judgement. Treat them as a helpful guide, not lab results."],
  ["How does it know what a meal does to my sugar?", "It doesn't guess. It looks at your own past meals that have a reading before and 2 hours after, and shows the range they gave you. With too little data it says so."],
];

export default function Landing() {
  return (
    <div className="overflow-x-clip">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold text-moss">
          <LogoMark /> Sugar Saathi
        </Link>
        <ButtonLink href="/login" size="sm">Sign in</ButtonLink>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-6 md:grid-cols-[1.1fr_1fr] md:pt-12">
        <div className="rise-in">
          <p className="inline-block rounded-full bg-saffron-soft px-3 py-1 text-sm font-medium text-saffron-ink">Free plan · 7-day Pro trial · Made for Indian food</p>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] text-moss-deep sm:text-6xl">Know what your meals do to your sugar.</h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Say what you ate in Hindi or English. Get carbs, protein, fibre, fat and an honest read on how it may affect you. Then see it beside your glucose, day after day.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/login" size="lg" variant="saffron">Start free: 7 days of Pro</ButtonLink>
            <ButtonLink href="#day" size="lg" variant="outline">See a day with it</ButtonLink>
          </div>
          <p className="mt-4 text-sm text-muted">Sign in with Google. Your meals and readings stay on your device. Works on your phone, and you can add it to your home screen.</p>
        </div>

        {/* A sample meal report, built from the real components */}
        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-saffron-soft" aria-hidden="true" />
          <Card className="rise-in space-y-4 shadow-lift" aria-label="Example meal report">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Example meal report</p>
            <p className="font-display text-xl font-semibold">2 rotis, dal, bhindi sabzi, curd</p>
            <p className="text-2xl" aria-hidden="true">🫓 🍲 🥬 🥛</p>
            <div className="flex items-center gap-4">
              <MacroRing carbs={52} protein={21} fat={13} kcal={410} size={112} />
              <dl className="grid flex-1 grid-cols-2 gap-2 text-sm">
                <div><dt className="text-xs text-muted">Carbs</dt><dd className="tabular text-lg font-semibold">52 g</dd></div>
                <div><dt className="text-xs text-muted">Protein</dt><dd className="tabular text-lg font-semibold">21 g</dd></div>
                <div><dt className="text-xs text-muted">Fibre</dt><dd className="tabular text-lg font-semibold">12 g</dd></div>
                <div><dt className="text-xs text-muted">Fat</dt><dd className="tabular text-lg font-semibold">13 g</dd></div>
              </dl>
            </div>
            <div className="rounded-2xl bg-moss-soft px-4 py-3">
              <p className="font-display text-lg font-semibold text-leaf">Low glycemic impact</p>
              <p className="text-sm text-muted">Dal, vegetables and curd make a balanced plate.</p>
            </div>
            <div className="rounded-2xl bg-saffron-soft px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-saffron-ink">Expected change in your sugar</p>
              <p className="tabular text-2xl font-bold">+25 to +45 <span className="text-base font-medium">mg/dL</span></p>
              <p className="text-xs text-muted">From your own 6 similar meals. Sample data.</p>
            </div>
          </Card>
        </div>
      </section>

      {/* A day */}
      <section id="day" className="bg-sand/70 py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">A day with Sugar Saathi</h2>
          <p className="mt-2 max-w-2xl text-muted">Small habits that take seconds, and add up to a clear picture.</p>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DAY.map((d) => (
              <li key={d.title}>
                <Card className="h-full">
                  <span className="text-3xl" aria-hidden="true">{d.icon}</span>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-saffron-ink">{d.when}</p>
                  <h3 className="mt-1 font-display text-xl font-semibold">{d.title}</h3>
                  <p className="mt-1 text-sm text-muted">{d.body}</p>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">Everything for your plate, in one place</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(([icon, title, body]) => (
            <Card key={title}>
              <span className="text-3xl" aria-hidden="true">{icon}</span>
              <h3 className="mt-2 font-display text-xl font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted">{body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Honest by design */}
      <section className="mx-auto max-w-6xl px-5 pb-16">
        <Card tone="moss" className="!p-8 sm:!p-12">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Honest by design</h2>
          <ul className="mt-5 grid gap-4 text-white/90 sm:grid-cols-3">
            <li><strong className="block text-white">Numbers from a table, not AI</strong>The AI only recognises dishes. Nutrition is calculated by code from the food table.</li>
            <li><strong className="block text-white">Your readings only</strong>It never invents or predicts a glucose value. It learns only from numbers you enter or import.</li>
            <li><strong className="block text-white">Food guidance, not medical advice</strong>No doses, no medicines. Patterns are possible links to discuss with your educator.</li>
          </ul>
        </Card>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 pb-16">
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">Questions</h2>
        <div className="mt-6 divide-y divide-line rounded-3xl border border-line bg-paper">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group px-5 py-4">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {q}
                <span className="text-xl text-moss transition group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="mt-2 text-muted">{a}</p>
            </details>
          ))}
        </div>
        <div className="mt-8 text-center">
          <ButtonLink href="/login" size="lg">Start free</ButtonLink>
        </div>
      </section>

      <footer className="mx-auto max-w-3xl space-y-3 px-5 pb-12">
        <p className="text-sm"><Link href="/privacy" className="text-moss underline">Privacy</Link> · <Link href="/terms" className="text-moss underline">Terms</Link> · <Link href="/login" className="text-moss underline">Sign in</Link></p>
        <Disclaimer />
      </footer>
    </div>
  );
}
