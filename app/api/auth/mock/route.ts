import { NextResponse } from "next/server";
import { authMode, safeNext } from "@/lib/auth/config";
import { COOKIES, cookieOptions, sessionMaxAge, signSession } from "@/lib/auth/session";

// DEVELOPMENT ONLY: pretend to sign in as a test user in a chosen plan state, so the gating can be tested without Google.
// authMode() never returns "mock" in production builds, so this returns 404 there.
export async function GET(request: Request) {
  if (authMode() !== "mock") return new Response("Not found", { status: 404 });
  const url = new URL(request.url);
  const who = url.searchParams.get("user") === "b" ? "b" : "a";
  const state = url.searchParams.get("state") ?? "trial";
  const day = 86400_000;
  const trialStart = state === "trial" ? Date.now() - 1 * day : state === "lastday" ? Date.now() - 6.5 * day : Date.now() - 20 * day;
  const res = NextResponse.redirect(new URL(safeNext(url.searchParams.get("next")), url));
  res.cookies.set(COOKIES.session, await signSession({ sub: `mock-${who}`, email: `tester-${who}@example.test`, name: `Tester ${who.toUpperCase()}`, picture: null, trialStart, pro: state === "pro", mock: true }), cookieOptions(sessionMaxAge));
  return res;
}
