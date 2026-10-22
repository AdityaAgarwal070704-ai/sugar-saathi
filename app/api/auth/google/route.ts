import { NextResponse } from "next/server";
import { authMode, safeNext } from "@/lib/auth/config";
import { buildAuthUrl, makePkce, randomToken, redirectUri } from "@/lib/auth/google";
import { COOKIES, cookieOptions, signAttempt } from "@/lib/auth/session";

// Step 1 of signing in: remember this attempt in a short-lived signed cookie, then send the user to Google.
export async function GET(request: Request) {
  if (authMode() !== "google") return NextResponse.redirect(new URL("/login?error=not_configured", request.url));
  const next = safeNext(new URL(request.url).searchParams.get("next"));
  const state = randomToken();
  const nonce = randomToken();
  const { verifier, challenge } = makePkce();
  const url = buildAuthUrl({ clientId: process.env.GOOGLE_CLIENT_ID ?? "", redirect: redirectUri(request), state, nonce, challenge });
  const res = NextResponse.redirect(url);
  res.cookies.set(COOKIES.oauth, await signAttempt({ state, nonce, verifier, next }), cookieOptions(600));
  return res;
}
