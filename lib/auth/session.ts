import { jwtVerify, SignJWT } from "jose";

// Signed cookies. Nothing here is stored on a server: the signature (made with AUTH_SECRET) is what proves a cookie is genuine.
export const COOKIES = { session: "ss_session", oauth: "ss_oauth", trial: "ss_trial" } as const;

export type SessionClaims = {
  sub: string; // Google account id
  email: string;
  name: string;
  picture: string | null;
  trialStart: number | null; // ms since epoch, when this browser first started the trial
  pro?: boolean; // only ever set by the development mock login
  mock?: boolean;
};

const SESSION_DAYS = 30;
const TRIAL_COOKIE_DAYS = 400; // the longest lifetime browsers allow

const key = () => new TextEncoder().encode(process.env.AUTH_SECRET ?? "");

export const sessionMaxAge = SESSION_DAYS * 86400;
export const trialMaxAge = TRIAL_COOKIE_DAYS * 86400;

export function cookieOptions(maxAge: number) {
  return { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge };
}

async function sign(payload: Record<string, unknown>, seconds: number): Promise<string> {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(`${seconds}s`).sign(key());
}

async function verify<T>(token: string | undefined): Promise<T | null> {
  if (!token || !process.env.AUTH_SECRET) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    return payload as T;
  } catch {
    return null;
  }
}

export const signSession = (c: SessionClaims) => sign({ ...c }, sessionMaxAge);

export async function readSession(token: string | undefined): Promise<SessionClaims | null> {
  const p = await verify<Partial<SessionClaims>>(token);
  if (!p || typeof p.sub !== "string" || typeof p.email !== "string") return null;
  return {
    sub: p.sub,
    email: p.email,
    name: typeof p.name === "string" ? p.name : "",
    picture: typeof p.picture === "string" ? p.picture : null,
    trialStart: typeof p.trialStart === "number" ? p.trialStart : null,
    pro: p.pro === true,
    mock: p.mock === true,
  };
}

// The trial cookie outlives sign-outs, so signing out and back in does not restart the trial in the same browser.
export const signTrial = (sub: string, start: number) => sign({ sub, start }, trialMaxAge);

export async function readTrial(token: string | undefined, sub: string): Promise<number | null> {
  const p = await verify<{ sub?: string; start?: number }>(token);
  return p && p.sub === sub && typeof p.start === "number" ? p.start : null;
}

// Short-lived record of one sign-in attempt (protects against forged callbacks).
export type OAuthAttempt = { state: string; nonce: string; verifier: string; next: string };
export const signAttempt = (a: OAuthAttempt) => sign({ ...a }, 600);
export async function readAttempt(token: string | undefined): Promise<OAuthAttempt | null> {
  const p = await verify<Partial<OAuthAttempt>>(token);
  return p && typeof p.state === "string" && typeof p.nonce === "string" && typeof p.verifier === "string" && typeof p.next === "string" ? (p as OAuthAttempt) : null;
}

export function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (header ?? "").split(/;\s*/)) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i)] = decodeURIComponent(part.slice(i + 1));
  }
  return out;
}
