"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/app/progress", label: "Overview" },
  { href: "/app/history", label: "Meals" },
  { href: "/app/glucose", label: "Glucose" },
];

export default function ProgressTabs() {
  const path = usePathname();
  return (
    <nav aria-label="Progress sections" className="inline-flex rounded-full border border-line bg-paper p-1">
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} aria-current={path === t.href ? "page" : undefined} className={`min-h-9 rounded-full px-4 py-1.5 text-sm font-medium ${path === t.href ? "bg-moss text-white" : "text-ink hover:bg-sand"}`}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
