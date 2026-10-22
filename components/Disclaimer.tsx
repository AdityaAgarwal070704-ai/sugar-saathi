"use client";

import { useT } from "@/lib/useT";

export default function Disclaimer() {
  const { t } = useT();
  return <p className="text-xs leading-relaxed text-muted">{t("common.disclaimer")}</p>;
}
