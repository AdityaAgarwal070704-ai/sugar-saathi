"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import DataBackup from "@/components/DataBackup";
import LanguageToggle from "@/components/LanguageToggle";
import SettingsForm from "@/components/SettingsForm";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/useT";

export default function MePage() {
  const { ready, profile } = useStore();
  const { t } = useT();
  const { status, user, plan, signOut } = useAuth();
  if (!ready) return <p className="text-muted">{t("common.loading")}</p>;
  return (
    <>
      <h1 className="font-display text-3xl font-semibold">{t("me.title")}</h1>
      {status === "signedIn" && user && (
        <Card>
          <div className="flex items-center gap-3">
            {user.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.picture} alt="" width={48} height={48} referrerPolicy="no-referrer" className="h-12 w-12 rounded-full" />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-moss text-lg font-semibold text-white" aria-hidden="true">{(user.name || user.email)[0]?.toUpperCase()}</span>
            )}
            <div className="min-w-0">
              <p className="truncate font-semibold">{user.name || user.email}</p>
              <p className="truncate text-sm text-muted">{user.email}</p>
            </div>
            <span className="ml-auto">
              {plan.tier === "trial" ? <Pill tone="warn">Trial · {plan.trialDaysLeft}d left</Pill> : plan.tier === "pro" ? <Pill tone="dark">Pro</Pill> : <Pill>Free</Pill>}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/app/upgrade" className="inline-flex min-h-9 items-center rounded-full bg-moss-soft px-3.5 text-sm font-medium text-moss hover:bg-[#d3e6da]">Free and Pro</Link>
            <Button size="sm" variant="outline" onClick={() => signOut(false)}>Sign out</Button>
            <Button size="sm" variant="danger" onClick={() => { if (window.confirm("Sign out and delete this account's meals, readings and settings from THIS device? Export a backup first if you want to keep them.")) signOut(true); }}>Sign out and clear this device</Button>
          </div>
          <p className="mt-3 text-xs text-muted">Your meals and readings are stored on this device. Only your Google name and email are kept in your sign-in cookie. See the <Link href="/privacy" className="underline">Privacy Policy</Link>.</p>
        </Card>
      )}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold">Language / भाषा</h2>
          <LanguageToggle />
        </div>
        <p className="mt-2 text-xs text-muted">{t("me.langNote")}</p>
      </Card>
      <Link href="/app/routine" className="block rounded-3xl border border-line bg-paper p-5 shadow-soft transition hover:shadow-lift">
        <h2 className="font-display text-xl font-semibold">{t("me.routine")}</h2>
        <p className="mt-1 text-sm text-muted">{t("me.routineBody")}</p>
      </Link>
      <Card>
        <h2 className="mb-3 font-display text-xl font-semibold">{t("me.goals")}</h2>
        <SettingsForm profile={profile} />
      </Card>
      <Card>
        <h2 className="mb-3 font-display text-xl font-semibold">{t("me.data")}</h2>
        <DataBackup />
      </Card>
    </>
  );
}
