"use client";

import { useT } from "@/lib/useT";
import type { Streak } from "@/lib/streak";
import { Pill } from "./Pill";

export function StreakChip({ streak }: { streak: Streak }) {
  const { t } = useT();
  if (streak.state === "new") return <Pill tone="neutral">🌱 {t("streak.new")}</Pill>;
  if (streak.state === "welcome-back") return <Pill tone="neutral">🌿 {t("streak.back")}</Pill>;
  if (streak.state === "keep-going") return <Pill tone="warn">🔥 {t("streak.keep", { n: streak.current })}</Pill>;
  return <Pill tone="good">🔥 {t("streak.days", { n: streak.current })}</Pill>;
}
