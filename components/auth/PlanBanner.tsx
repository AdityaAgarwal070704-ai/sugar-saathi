"use client";

import Link from "next/link";
import { usePlan } from "./AuthProvider";

// A slim reminder under the header: how many trial days are left, or that the trial has ended.
export default function PlanBanner() {
  const { tier, trialDaysLeft, trialExpired, isOpen } = usePlan();
  if (isOpen) return null;
  if (tier === "trial") {
    return (
      <div className="mx-auto max-w-5xl px-4 pt-3 md:px-6 print:hidden">
        <Link href="/app/upgrade" className="flex items-center justify-between gap-3 rounded-2xl bg-saffron-soft px-4 py-2 text-sm hover:brightness-95">
          <span>🎁 <strong>Pro trial:</strong> {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left. Everything is unlocked.</span>
          <span className="shrink-0 font-medium text-moss underline">Plans</span>
        </Link>
      </div>
    );
  }
  if (tier === "free" && trialExpired) {
    return (
      <div className="mx-auto max-w-5xl px-4 pt-3 md:px-6 print:hidden">
        <Link href="/app/upgrade" className="flex items-center justify-between gap-3 rounded-2xl bg-sand px-4 py-2 text-sm hover:brightness-95">
          <span>Your 7-day Pro trial has ended. You&apos;re on Free, and all your data is still here.</span>
          <span className="shrink-0 font-medium text-moss underline">Plans</span>
        </Link>
      </div>
    );
  }
  return null;
}
