"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LegacyDataPrompt from "@/components/auth/LegacyDataPrompt";
import PlanBanner from "@/components/auth/PlanBanner";
import Disclaimer from "@/components/Disclaimer";
import LanguageToggle from "@/components/LanguageToggle";
import { ChartIcon, CompassIcon, HomeIcon, LogoMark, PlusIcon, UserIcon } from "@/components/ui/icons";
import { useEffect } from "react";
import { useT } from "@/lib/useT";

const TABS = [
  { href: "/app", label: "nav.today" as const, match: (p: string) => p === "/app", Icon: HomeIcon },
  { href: "/app/progress", label: "nav.progress" as const, match: (p: string) => /^\/app\/(progress|history|glucose|meal)/.test(p), Icon: ChartIcon },
  { href: "/app/discover", label: "nav.discover" as const, match: (p: string) => /^\/app\/(discover|planner|report|recipes|learn)/.test(p), Icon: CompassIcon },
  { href: "/app/me", label: "nav.me" as const, match: (p: string) => /^\/app\/(me|settings)/.test(p), Icon: UserIcon },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { t, lang } = useT();
  // Tell the browser which language the page is in (screen readers, hyphenation, Devanagari line spacing).
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const logActive = path.startsWith("/app/log");

  return (
    <div className="min-h-screen">
      {/* Desktop top bar */}
      <header className="sticky top-0 z-30 hidden border-b border-line bg-cream/90 backdrop-blur md:block print:hidden">
        <div className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-3">
          <Link href="/app" className="flex items-center gap-2 font-display text-xl font-semibold text-moss">
            <LogoMark /> Sugar Saathi
          </Link>
          <nav className="flex flex-1 gap-1" aria-label={t("nav.main")}>
            {TABS.map(({ href, label, match, Icon }) => (
              <Link key={href} href={href} aria-current={match(path) ? "page" : undefined} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${match(path) ? "bg-moss text-white" : "text-ink hover:bg-sand"}`}>
                <Icon className="h-4 w-4" /> {t(label)}
              </Link>
            ))}
          </nav>
          <LanguageToggle />
          <Link href="/app/log" className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-soft ${logActive ? "bg-moss-deep text-white" : "bg-saffron text-ink hover:brightness-95"}`}>
            <PlusIcon className="h-4 w-4" /> {t("nav.log")}
          </Link>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="flex items-center justify-between gap-2 px-4 pt-4 md:hidden print:hidden">
        <Link href="/app" className="flex items-center gap-2 font-display text-lg font-semibold text-moss">
          <LogoMark size={26} /> Sugar Saathi
        </Link>
        <LanguageToggle />
      </header>

      <PlanBanner />
      <LegacyDataPrompt />

      <main className="mx-auto max-w-5xl px-4 pb-32 pt-4 md:px-6 md:pb-12 md:pt-8">
        <div className="space-y-5">{children}</div>
        <div className="mt-10 print:hidden">
          <Disclaimer />
        </div>
      </main>

      {/* Mobile bottom tabs, with the big Log button in the centre */}
      <nav aria-label={t("nav.main")} className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden print:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-5 items-end px-2">
          {TABS.slice(0, 2).map(({ href, label, match, Icon }) => (
            <TabLink key={href} href={href} label={t(label)} active={match(path)} Icon={Icon} />
          ))}
          <li className="flex justify-center">
            <Link href="/app/log" aria-label={t("nav.log")} aria-current={logActive ? "page" : undefined} className={`-mt-6 flex h-16 w-16 items-center justify-center rounded-full border-4 border-cream shadow-lift ${logActive ? "bg-moss-deep text-white" : "bg-saffron text-ink"}`}>
              <PlusIcon className="h-8 w-8" />
            </Link>
          </li>
          {TABS.slice(2).map(({ href, label, match, Icon }) => (
            <TabLink key={href} href={href} label={t(label)} active={match(path)} Icon={Icon} />
          ))}
        </ul>
      </nav>
    </div>
  );
}

function TabLink({ href, label, active, Icon }: { href: string; label: string; active: boolean; Icon: (p: { className?: string }) => React.ReactElement }) {
  return (
    <li>
      <Link href={href} aria-current={active ? "page" : undefined} className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl py-2 text-[11px] font-medium ${active ? "text-moss" : "text-muted"}`}>
        <Icon className={`h-6 w-6 ${active ? "stroke-[2.2]" : ""}`} />
        {label}
      </Link>
    </li>
  );
}
