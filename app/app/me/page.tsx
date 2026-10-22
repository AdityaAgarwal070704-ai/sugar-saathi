"use client";

import Link from "next/link";
import DataBackup from "@/components/DataBackup";
import LanguageToggle from "@/components/LanguageToggle";
import SettingsForm from "@/components/SettingsForm";
import { Card } from "@/components/ui/Card";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/useT";

export default function MePage() {
  const { ready, profile } = useStore();
  const { t } = useT();
  if (!ready) return <p className="text-muted">{t("common.loading")}</p>;
  return (
    <>
      <h1 className="font-display text-3xl font-semibold">{t("me.title")}</h1>
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
