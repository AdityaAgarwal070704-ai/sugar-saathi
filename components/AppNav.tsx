"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

const LINKS = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/log", label: "Log meal" },
  { href: "/app/history", label: "History" },
  { href: "/app/glucose", label: "Glucose" },
  { href: "/app/insights", label: "Insights" },
  { href: "/app/planner", label: "Planner" },
  { href: "/app/report", label: "Report" },
  { href: "/app/settings", label: "Settings" },
];

export default function AppNav() {
  const path = usePathname();
  const router = useRouter();

  const signOut = async () => {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="border-b border-zinc-200 bg-white print:hidden">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link href="/app" className="text-lg font-bold text-emerald-800">
          Sugar Saathi
        </Link>
        <nav className="flex flex-1 flex-wrap gap-1 text-sm">
          {LINKS.map((l) => {
            const active = l.href === "/app" ? path === "/app" : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded px-2 py-1 ${active ? "bg-emerald-100 font-medium text-emerald-900" : "text-zinc-600 hover:bg-zinc-100"}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <button type="button" onClick={signOut} className="text-sm text-zinc-600 underline">
          Sign out
        </button>
      </div>
    </header>
  );
}
