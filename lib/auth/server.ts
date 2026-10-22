import { DAILY_LIMITS, parseEmailList, planStatus, ROUTE_FEATURE, can, type PlanStatus, type Tier, type UsageKind } from "../plan";
import { recordUse, usedToday } from "../quota";
import { tooMany } from "../ratelimit";
import { authMode } from "./config";
import { COOKIES, parseCookies, readSession, type SessionClaims } from "./session";

export async function sessionFromRequest(request: Request): Promise<SessionClaims | null> {
  if (authMode() === "open") return null;
  return readSession(parseCookies(request.headers.get("cookie"))[COOKIES.session]);
}

export function planFor(claims: SessionClaims, nowMs = Date.now()): PlanStatus {
  const isPro = claims.pro === true || parseEmailList(process.env.PRO_EMAILS).has(claims.email.toLowerCase());
  return planStatus({ trialStartMs: claims.trialStart, isPro, nowMs });
}

export type AuthResult =
  | { ok: true; tier: Tier; userId: string; commit: () => void }
  | { ok: false; response: Response };

const deny = (code: "signin" | "pro_required" | "limit" | "busy", message: string, status: number) =>
  ({ ok: false, response: Response.json({ error: message, code }, { status }) }) as const;

// Every AI route calls this first. It checks who is asking, whether their plan includes the feature, and their daily cap.
// Call `commit()` after the AI answered, so failed calls don't use up the cap.
export async function authorize(request: Request, kind: UsageKind): Promise<AuthResult> {
  if (authMode() === "open") {
    // No login configured: everything is open, with the old per-IP burst limit.
    return tooMany(request, kind, 40) ? deny("busy", "Too many requests right now. Please wait a few minutes and try again.", 429) : { ok: true, tier: "pro", userId: "open", commit: () => {} };
  }
  const claims = await sessionFromRequest(request);
  if (!claims) return deny("signin", "Please sign in to continue.", 401);

  const plan = planFor(claims);
  const feature = ROUTE_FEATURE[kind];
  if (feature && !can(plan.tier, feature)) {
    return deny("pro_required", plan.trialExpired ? "Your free trial has ended. This is a Pro feature, and Pro is coming soon." : "This is a Pro feature. Pro is coming soon.", 403);
  }
  const limit = DAILY_LIMITS[plan.tier][kind];
  if (usedToday(claims.sub, kind) >= limit) {
    return deny("limit", plan.tier === "free" ? `You've used your ${limit} free AI-read meals for today. Typing a meal and picking dishes by hand still works, and Pro (coming soon) raises the limit.` : "You've reached today's limit for this feature. Please try again tomorrow.", 429);
  }
  return { ok: true, tier: plan.tier, userId: claims.sub, commit: () => recordUse(claims.sub, kind) };
}
