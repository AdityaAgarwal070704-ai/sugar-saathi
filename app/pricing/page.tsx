import Link from "next/link";
import Disclaimer from "@/components/Disclaimer";
import { PRO_PRICE_LABEL } from "@/lib/session";

const FREE = ["3 AI meal logs per day", "Last 7 days of history", "Per-meal tips and swaps", "Dashboard and weekly observations", "Quick glucose entry and meal pairing"];
const PRO = ["Unlimited AI meal logs", "Full history", "CSV glucose import (CGM and meter exports)", "AI weekly narrative of possible links", "One-page educator report (print or PDF)", "Day meal planner within your carb goal"];

export default function Pricing() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/" className="text-sm text-emerald-800">← Sugar Saathi</Link>
      <h1 className="mt-4 text-3xl font-bold">Pricing</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-semibold">Free</h2>
          <p className="mt-1 text-2xl font-bold">₹0</p>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-zinc-700">{FREE.map((f) => <li key={f}>{f}</li>)}</ul>
          <Link href="/login?mode=signup" className="mt-5 inline-block rounded-lg border border-zinc-300 px-4 py-2">Start free</Link>
        </section>
        <section className="rounded-xl border-2 border-emerald-700 bg-white p-6">
          <h2 className="text-xl font-semibold">Pro</h2>
          <p className="mt-1 text-2xl font-bold">{PRO_PRICE_LABEL}</p>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-zinc-700">{PRO.map((f) => <li key={f}>{f}</li>)}</ul>
          <Link href="/login?mode=signup&next=upgrade" className="mt-5 inline-block rounded-lg bg-emerald-700 px-4 py-2 text-white">Get Pro</Link>
        </section>
      </div>
      <div className="mt-8"><Disclaimer /></div>
    </main>
  );
}
