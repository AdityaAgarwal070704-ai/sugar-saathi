"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { LogoMark } from "@/components/ui/icons";
import { useAuth } from "./AuthProvider";

// Shows the app only when the login state is known. Signed-out visitors are sent to the login screen.
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { status, retry } = useAuth();

  useEffect(() => {
    // A full page load is intended here: it resets all in-memory state for the signed-out visitor.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    if (status === "signedOut") window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
  }, [status]);

  if (status === "loading" || status === "signedOut") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-muted" role="status" aria-live="polite">
        <LogoMark size={44} />
        <p>Loading…</p>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-4 px-6 text-center">
        <LogoMark size={44} />
        <h1 className="font-display text-2xl font-semibold">We couldn&apos;t check your login</h1>
        <p className="text-muted">Please check your internet connection and try again.</p>
        <Button onClick={retry}>Try again</Button>
      </div>
    );
  }
  return <>{children}</>;
}
