"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { FEATURE_LABEL, type Feature } from "@/lib/plan";

// Shows children when the user's plan includes the feature, otherwise a calm "this is part of Pro" card.
// `compact` is a one-line version for use inside other cards.
export default function ProGate({ feature, children, teaser, compact = false }: { feature: Feature; children: ReactNode; teaser?: ReactNode; compact?: boolean }) {
  const { can, plan } = useAuth();
  if (can(feature)) return <>{children}</>;
  const why = plan.trialExpired ? "Your 7-day trial has ended." : "";
  if (compact) {
    return (
      <p className="rounded-2xl bg-sand px-4 py-3 text-sm">
        🔒 <strong>{FEATURE_LABEL[feature]}</strong> is part of Pro. {why} <Link href="/app/upgrade" className="font-medium text-moss underline">See Free vs Pro</Link>
      </p>
    );
  }
  return (
    <Card tone="sand">
      <p className="text-3xl" aria-hidden="true">🔒</p>
      <h2 className="mt-1 font-display text-xl font-semibold">{FEATURE_LABEL[feature]} is part of Pro</h2>
      <p className="mt-1 text-sm text-muted">{why} Pro is coming soon, and everything in it was free during your 7-day trial.</p>
      {teaser && <div className="mt-3 rounded-2xl border border-dashed border-line bg-paper p-3 text-sm text-muted">{teaser}</div>}
      <Link href="/app/upgrade" className="mt-3 inline-block font-medium text-moss underline">See Free vs Pro</Link>
    </Card>
  );
}
