import { NextResponse } from "next/server";
import { authMode } from "@/lib/auth/config";
import { completeSignIn, redirectUri } from "@/lib/auth/google";
import { COOKIES, cookieOptions, parseCookies, readAttempt, readTrial, sessionMaxAge, signSession, signTrial, trialMaxAge } from "@/lib/auth/session";

// Step 2: Google sends the user back here with a one-time code. We check it belongs to the attempt we started, verify the
// identity Google vouches for, and set a signed session cookie.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const fail = (code: string) => {
    const res = NextResponse.redirect(new URL(`/login?error=${code}`, url));
    res.cookies.delete(COOKIES.oauth);
    return res;
  };
  if (authMode() !== "google") return fail("not_configured");
  if (url.searchParams.get("error")) return fail(url.searchParams.get("error") === "access_denied" ? "denied" : "failed");

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookies = parseCookies(request.headers.get("cookie"));
  const attempt = await readAttempt(cookies[COOKIES.oauth]);
  if (!code || !state || !attempt || attempt.state !== state) return fail("expired");

  let profile;
  try {
    profile = await completeSignIn({ code, verifier: attempt.verifier, nonce: attempt.nonce, redirect: redirectUri(request) });
  } catch {
    return fail("failed");
  }

  // The trial starts the first time this browser signs in with this Google account, and is remembered across sign-outs.
  const known = await readTrial(cookies[COOKIES.trial], profile.sub);
  const trialStart = known ?? Date.now();

  const res = NextResponse.redirect(new URL(attempt.next, url));
  res.cookies.set(COOKIES.session, await signSession({ ...profile, trialStart }), cookieOptions(sessionMaxAge));
  if (known === null) res.cookies.set(COOKIES.trial, await signTrial(profile.sub, trialStart), cookieOptions(trialMaxAge));
  res.cookies.delete(COOKIES.oauth);
  return res;
}
