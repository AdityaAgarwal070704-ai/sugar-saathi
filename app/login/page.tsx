"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LogoMark } from "@/components/ui/icons";
import type { AuthMode } from "@/lib/auth/config";
import { safeNext } from "@/lib/auth/config";

const ERRORS: Record<string, string> = {
  denied: "Sign-in was cancelled. You can try again whenever you like.",
  expired: "That sign-in took too long or was interrupted. Please try again.",
  failed: "We couldn't complete the sign-in with Google. Please try again.",
  not_configured: "Sign-in isn't set up on this site yet.",
};

function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.5 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.8 2.3-8.3 2.3-6.3 0-11.6-4-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

function LoginInner() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const errorCode = params.get("error");
  const [mode, setMode] = useState<AuthMode | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();
        setMode(data.mode);
        if (data.user) {
          setSignedIn(true);
          window.location.replace(next);
        }
      } catch {
        setMode("google");
      }
    })();
  }, [next]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 px-5 py-10">
      <Link href="/" className="flex items-center gap-2 font-display text-2xl font-semibold text-moss">
        <LogoMark size={34} /> Sugar Saathi
      </Link>
      <div>
        <h1 className="font-display text-4xl font-semibold leading-tight">Welcome back</h1>
        <p className="mt-2 text-muted">Sign in to see your meals, readings and progress.</p>
      </div>

      <Card className="space-y-4">
        {errorCode && <p role="alert" className="rounded-2xl bg-terracotta-soft px-4 py-3 text-sm text-terracotta">{ERRORS[errorCode] ?? ERRORS.failed}</p>}

        {mode === "open" ? (
          <>
            <p className="text-sm">Sign-in isn&apos;t switched on for this site yet, so the app is open to everyone for now.</p>
            <ButtonLink href="/app" size="lg" className="w-full">Open the app</ButtonLink>
          </>
        ) : (
          <>
            <a href={`/api/auth/google?next=${encodeURIComponent(next)}`} className="flex min-h-14 items-center justify-center gap-3 rounded-full border border-line bg-white px-6 text-lg font-medium shadow-soft hover:bg-sand">
              <GoogleMark /> Continue with Google
            </a>
            {signedIn && <p className="text-center text-sm text-muted">You&apos;re signed in. Taking you to the app…</p>}
            <p className="text-xs text-muted">
              By continuing you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>. Sugar Saathi is for adults and gives food guidance, not medical advice.
            </p>
          </>
        )}

        {mode === "mock" && (
          <div className="rounded-2xl border border-dashed border-saffron p-3 text-sm">
            <p className="font-semibold">Development only: fake sign-in</p>
            <ul className="mt-2 grid gap-1.5">
              {[["trial", "New user, Pro trial (6 days left)"], ["lastday", "Trial ends tomorrow"], ["expired", "Trial ended, on Free"], ["pro", "Pro user"]].map(([s, l]) => (
                <li key={s} className="flex gap-2">
                  <a className="underline" href={`/api/auth/mock?state=${s}&user=a&next=${encodeURIComponent(next)}`}>{l}</a>
                  <span className="text-muted">(user A)</span>
                </li>
              ))}
              <li><a className="underline" href={`/api/auth/mock?state=trial&user=b&next=${encodeURIComponent(next)}`}>Second user on this device</a> <span className="text-muted">(user B)</span></li>
            </ul>
          </div>
        )}
      </Card>

      <Card tone="saffron" className="!p-4 text-sm">
        <p className="font-semibold">🎁 New here? Everything is free for your first 7 days.</p>
        <p className="mt-1">After that you keep a free plan with the daily essentials. No card needed.</p>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
