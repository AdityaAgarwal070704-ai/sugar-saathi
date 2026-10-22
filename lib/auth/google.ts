import { createHash, randomBytes } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";

// Google sign-in (OpenID Connect, authorization code flow with PKCE). No third-party login service is involved.
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

const b64url = (buf: Buffer) => buf.toString("base64url");
export const randomToken = (bytes = 24) => b64url(randomBytes(bytes));

export function makePkce() {
  const verifier = randomToken(32);
  const challenge = b64url(createHash("sha256").update(verifier).digest());
  return { verifier, challenge };
}

export function redirectUri(request: Request): string {
  const origin = process.env.AUTH_URL?.replace(/\/$/, "") ?? new URL(request.url).origin;
  return `${origin}/api/auth/callback`;
}

export function buildAuthUrl(opts: { clientId: string; redirect: string; state: string; nonce: string; challenge: string }): string {
  const u = new URL(AUTH_URL);
  u.search = new URLSearchParams({
    client_id: opts.clientId,
    redirect_uri: opts.redirect,
    response_type: "code",
    scope: "openid email profile",
    state: opts.state,
    nonce: opts.nonce,
    code_challenge: opts.challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return u.toString();
}

export type GoogleProfile = { sub: string; email: string; name: string; picture: string | null };

// Swaps the one-time code for tokens, then checks the ID token's signature, issuer, audience, expiry and nonce.
export async function completeSignIn(opts: { code: string; verifier: string; nonce: string; redirect: string }): Promise<GoogleProfile> {
  const clientId = process.env.GOOGLE_CLIENT_ID ?? "";
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code: opts.code, client_id: clientId, client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "", redirect_uri: opts.redirect, grant_type: "authorization_code", code_verifier: opts.verifier }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error("token-exchange");
  const { id_token } = (await res.json()) as { id_token?: string };
  if (!id_token) throw new Error("no-id-token");
  const { payload } = await jwtVerify(id_token, JWKS, { issuer: ["https://accounts.google.com", "accounts.google.com"], audience: clientId });
  if (payload.nonce !== opts.nonce) throw new Error("bad-nonce");
  if (typeof payload.sub !== "string" || typeof payload.email !== "string" || payload.email_verified !== true) throw new Error("unverified-email");
  return { sub: payload.sub, email: payload.email.toLowerCase(), name: typeof payload.name === "string" ? payload.name : "", picture: typeof payload.picture === "string" ? payload.picture : null };
}
