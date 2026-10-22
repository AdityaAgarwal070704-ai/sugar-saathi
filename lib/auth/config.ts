// Which kind of login the app is running with.
//  - "google": real Google sign-in (needs GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and AUTH_SECRET).
//  - "mock":   a fake login for local development only, so gating can be tested without Google. Never active in production.
//  - "open":   no login configured. The app works for everyone with every feature, exactly as before accounts existed.
export type AuthMode = "google" | "mock" | "open";

export function authMode(): AuthMode {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) return "open";
  if (process.env.NODE_ENV !== "production" && process.env.AUTH_MOCK === "1") return "mock";
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) return "google";
  return "open";
}

// Only paths inside the app (or the home page) are allowed as a "go back to" target, so a crafted link can't bounce
// someone to another website after login.
export function safeNext(next: string | null | undefined): string {
  if (next && /^\/(app(\/[A-Za-z0-9_\-./?=&%]*)?)?$/.test(next) && !next.includes("//")) return next;
  return "/app";
}
