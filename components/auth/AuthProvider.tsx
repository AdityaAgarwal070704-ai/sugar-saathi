"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AuthMode } from "@/lib/auth/config";
import { can as canUse, type Feature, type PlanStatus } from "@/lib/plan";
import { store } from "@/lib/store";

export type AuthUser = { id: string; email: string; name: string; picture: string | null };
type Status = "loading" | "open" | "signedOut" | "signedIn" | "error";

type Ctx = {
  status: Status;
  mode: AuthMode | null;
  user: AuthUser | null;
  plan: PlanStatus;
  can: (feature: Feature) => boolean;
  signOut: (clearDevice?: boolean) => Promise<void>;
  retry: () => void;
};

// Without a login configured, everyone gets everything (as before accounts existed).
const OPEN_PLAN: PlanStatus = { tier: "pro", trialEndsAt: null, trialDaysLeft: 0, trialExpired: false };
const FREE_PLAN: PlanStatus = { tier: "free", trialEndsAt: null, trialDaysLeft: 0, trialExpired: false };

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [mode, setMode] = useState<AuthMode | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [plan, setPlan] = useState<PlanStatus>(FREE_PLAN);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) throw new Error("bad status");
        const data = (await res.json()) as { mode: AuthMode; user: AuthUser | null; plan: PlanStatus | null };
        if (cancelled) return;
        setMode(data.mode);
        if (data.mode === "open") {
          store.setUser(null);
          setUser(null);
          setPlan(OPEN_PLAN);
          setStatus("open");
        } else if (data.user && data.plan) {
          store.setUser(data.user.id); // load this account's own data before anything renders
          setUser(data.user);
          setPlan(data.plan);
          setStatus("signedIn");
        } else {
          setStatus("signedOut");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const signOut = useCallback(async (clearDevice = false) => {
    if (clearDevice) store.clearAll();
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // the redirect below still ends the visit
    }
    store.setUser(null);
    // A full page load clears all in-memory state after signing out.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/login";
  }, []);

  const value = useMemo<Ctx>(
    () => ({ status, mode, user, plan, can: (f) => canUse(plan.tier, f), signOut, retry: () => { setStatus("loading"); setAttempt((n) => n + 1); } }),
    [status, mode, user, plan, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): Ctx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

// For components that may render outside the provider (public pages): falls back to "open, everything unlocked".
export function useAuthOptional(): Ctx | null {
  return useContext(AuthContext);
}

export function usePlan() {
  const { plan, can, status } = useAuth();
  return { ...plan, can, isOpen: status === "open" };
}
