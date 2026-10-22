"use client";

import Link from "next/link";
import { usePlan } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { DAILY_LIMITS, FEATURE_LABEL, PRO_FEATURES } from "@/lib/plan";

const FREE_INCLUDES = [
  "Log meals by typing, voice or \"your usual\", up to " + DAILY_LIMITS.free.parse + " AI-read meals a day",
  "Nutrition, glycemic gauge, plate balance, tips and swaps for every meal",
  "Today, routine, walk timer, streaks and phone reminders",
  "Glucose entry and safety cards, 7-day progress overview",
  "Manual recipe builder, Learn, Eating out, Fasting and festivals, Hindi",
  "Backup, restore and delete your data, always",
];

const WAITLIST = process.env.NEXT_PUBLIC_WAITLIST_URL;

export default function Upgrade() {
  const { tier, trialDaysLeft, trialEndsAt, trialExpired, isOpen } = usePlan();
  const ends = trialEndsAt ? new Date(trialEndsAt).toLocaleDateString("en-IN", { day: "numeric", month: "long" }) : null;

  return (
    <>
      <div>
        <h1 className="font-display text-3xl font-semibold">Free and Pro</h1>
        <p className="mt-1 text-muted">Start with everything for 7 days. Keep the essentials free, always.</p>
      </div>

      <Card tone={tier === "trial" ? "saffron" : "paper"}>
        <h2 className="font-display text-xl font-semibold">Your plan</h2>
        <p className="mt-1">
          {isOpen && "Sign-in isn't switched on for this site yet, so every feature is open."}
          {!isOpen && tier === "trial" && <>🎁 You&apos;re on the <strong>Pro trial</strong>: {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left{ends ? `, until ${ends}` : ""}. Everything is unlocked.</>}
          {!isOpen && tier === "free" && <>You&apos;re on <strong>Free</strong>.{trialExpired ? " Your 7-day trial has ended, and all your data is still here." : ""}</>}
          {!isOpen && tier === "pro" && <>You have <strong>Pro</strong>. Thank you!</>}
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-display text-xl font-semibold">Free <Pill tone="neutral">forever</Pill></h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">{FREE_INCLUDES.map((f) => <li key={f}>{f}</li>)}</ul>
        </Card>
        <Card className="border-2 !border-moss">
          <h2 className="font-display text-xl font-semibold">Pro <Pill tone="warn">coming soon</Pill></h2>
          <p className="mt-1 text-sm text-muted">Everything in Free, plus:</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm">
            <li>Up to {DAILY_LIMITS.pro.parse} AI-read meals a day</li>
            {PRO_FEATURES.map((f) => <li key={f}>{FEATURE_LABEL[f]}</li>)}
            <li className="text-muted">Cloud sync across your phones (planned)</li>
          </ul>
          <p className="mt-3 text-sm">Planned price: about ₹149 a month or ₹999 a year. Not final, and nothing is charged today.</p>
          {WAITLIST ? (
            <a href={WAITLIST} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center rounded-full bg-moss px-5 font-medium text-white hover:bg-moss-deep">Tell me when Pro launches</a>
          ) : (
            <p className="mt-3 rounded-2xl bg-sand px-4 py-2 text-sm">We&apos;ll announce Pro here when it&apos;s ready.</p>
          )}
        </Card>
      </div>

      <p className="text-xs text-muted">
        Safety is never locked: out-of-range reading cards, the disclaimer, adding readings and exporting your own data are free for everyone.{" "}
        <Link href="/privacy" className="underline">Privacy</Link> · <Link href="/terms" className="underline">Terms</Link>
      </p>
    </>
  );
}
