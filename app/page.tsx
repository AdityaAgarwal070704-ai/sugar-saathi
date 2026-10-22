import Link from "next/link";
import Disclaimer from "@/components/Disclaimer";

const FEATURES = [
  ["Log meals in plain words", "Type \"2 rotis, 1 katori dal, aloo sabzi\". Sugar Saathi splits it into dishes and household portions and you confirm in one tap."],
  ["Indian-food carb maths", "Carbs, fibre, protein and glycemic load come from an Indian food table, calculated by code, never guessed by AI."],
  ["Meal feedback you can act on", "What's good, what could be better, and simple swaps like brown rice for white, with the carbs saved."],
  ["Meals paired with glucose", "Import your CGM or meter CSV or add readings. Each meal is matched to its before and 2-hour values automatically."],
  ["Weekly patterns", "See which dishes and meals go with bigger rises, in plain language, as possible links to discuss with your educator."],
  ["One-page educator report", "Print or save a clean summary of your week before every appointment."],
  ["Day meal planner", "Get a day of Indian meals that fits your carb goal and diet, with every number calculated from the table."],
  ["Private by design", "No account needed. Your meals and readings are stored only in your own browser, with backup and restore."],
];

export default function Landing() {
  return (
    <main>
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <span className="text-lg font-bold text-emerald-800">Sugar Saathi</span>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/app" className="rounded-lg bg-emerald-700 px-3 py-1.5 text-white">Open the app</Link>
        </nav>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-14 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Your Indian food and glucose, finally in one place</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
          Built for adults managing type 2 diabetes who cook at home. Describe a meal, get an honest carb estimate and practical feedback, and see it beside your glucose.
        </p>
        <p className="mt-2 text-sm text-zinc-500">Free. No sign-up. Your data stays on your device.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/app" className="rounded-lg bg-emerald-700 px-5 py-3 font-medium text-white">Open the app, it&apos;s free</Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-4 pb-14 sm:grid-cols-2">
        {FEATURES.map(([title, body]) => (
          <div key={title} className="rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-zinc-600">{body}</p>
          </div>
        ))}
      </section>

      <footer className="mx-auto max-w-3xl px-4 pb-10">
        <Disclaimer />
      </footer>
    </main>
  );
}
