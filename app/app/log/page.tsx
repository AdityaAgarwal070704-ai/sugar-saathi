"use client";

import { Suspense } from "react";
import LogFlow from "@/components/log/LogFlow";

export default function LogPage() {
  return (
    <Suspense fallback={<p className="text-muted">Loading…</p>}>
      <LogFlow />
    </Suspense>
  );
}
