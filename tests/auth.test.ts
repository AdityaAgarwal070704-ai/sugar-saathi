import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { authMode, safeNext } from "../lib/auth/config";
import { signSession, readSession, signTrial, readTrial, signAttempt, readAttempt, parseCookies, COOKIES } from "../lib/auth/session";
import { authorize, planFor } from "../lib/auth/server";
import { resetQuotaForTests } from "../lib/quota";

// Configure "google" mode with dummy values. Nothing here talks to Google. (The modules read the environment when
// they are called, not when they are imported, so setting it here is early enough.)
process.env.AUTH_SECRET = "test-secret-test-secret-test-secret-1234";
process.env.GOOGLE_CLIENT_ID = "client-id";
process.env.GOOGLE_CLIENT_SECRET = "client-secret";
process.env.PRO_EMAILS = "vip@example.com";
delete process.env.AUTH_MOCK;
(process.env as Record<string, string>).NODE_ENV = "test";

const claims = (over: Partial<Parameters<typeof signSession>[0]> = {}) => ({ sub: "u1", email: "a@example.com", name: "A", picture: null, trialStart: Date.now() - 86400_000, ...over });
const reqWith = async (c: Parameters<typeof signSession>[0] | null) => new Request("http://localhost/api/x", { headers: c ? { cookie: `${COOKIES.session}=${await signSession(c)}` } : {} });

beforeEach(() => resetQuotaForTests());

test("auth mode follows the environment, and never mocks in production", () => {
  assert.equal(authMode(), "google");
  const keep = { ...process.env };
  delete process.env.GOOGLE_CLIENT_SECRET;
  assert.equal(authMode(), "open");
  process.env.GOOGLE_CLIENT_SECRET = keep.GOOGLE_CLIENT_SECRET;
  process.env.AUTH_MOCK = "1";
  assert.equal(authMode(), "mock");
  (process.env as Record<string, string>).NODE_ENV = "production";
  assert.equal(authMode(), "google"); // the mock is ignored in production
  (process.env as Record<string, string>).NODE_ENV = "test";
  delete process.env.AUTH_MOCK;
  process.env.AUTH_SECRET = "short";
  assert.equal(authMode(), "open"); // a weak secret is treated as "not configured"
  process.env.AUTH_SECRET = "test-secret-test-secret-test-secret-1234";
});

test("safeNext only allows paths inside the app", () => {
  assert.equal(safeNext("/app/log?slot=lunch"), "/app/log?slot=lunch");
  assert.equal(safeNext("/app"), "/app");
  for (const bad of ["https://evil.example", "//evil.example", "/\\evil", "javascript:alert(1)", "/login", "/app//evil", "", null, undefined]) assert.equal(safeNext(bad as string), "/app", String(bad));
});

test("sessions: round trip, tampering and wrong secrets are rejected", async () => {
  const token = await signSession(claims());
  assert.equal((await readSession(token))?.email, "a@example.com");
  assert.equal(await readSession(token + "x"), null);
  assert.equal(await readSession(token.slice(0, -4) + "AAAA"), null);
  assert.equal(await readSession(undefined), null);
  assert.equal(await readSession("not.a.jwt"), null);
  // a cookie that is a valid signed token but for something else (the trial cookie) is not a session
  assert.equal(await readSession(await signTrial("u1", 1)), null);
  process.env.AUTH_SECRET = "a-completely-different-secret-value-0000";
  assert.equal(await readSession(token), null);
  process.env.AUTH_SECRET = "test-secret-test-secret-test-secret-1234";
});

test("trial cookie only counts for the account it was made for", async () => {
  const t = await signTrial("u1", 12345);
  assert.equal(await readTrial(t, "u1"), 12345);
  assert.equal(await readTrial(t, "someone-else"), null);
  assert.equal(await readTrial(undefined, "u1"), null);
  assert.equal(await readTrial(t + "x", "u1"), null);
});

test("sign-in attempts are signed and complete", async () => {
  const a = await signAttempt({ state: "s", nonce: "n", verifier: "v", next: "/app" });
  const got = await readAttempt(a);
  assert.deepEqual({ state: got?.state, nonce: got?.nonce, verifier: got?.verifier, next: got?.next }, { state: "s", nonce: "n", verifier: "v", next: "/app" });
  assert.equal(await readAttempt(a + "x"), null);
  assert.equal(await readAttempt(await signSession(claims())), null); // a session is not an attempt
});

test("cookie header parsing", () => {
  assert.deepEqual(parseCookies("a=1; ss_session=abc.def; b=x%20y"), { a: "1", ss_session: "abc.def", b: "x y" });
  assert.deepEqual(parseCookies(null), {});
});

test("plans from claims: trial, expired, allowlisted pro", () => {
  assert.equal(planFor(claims()).tier, "trial");
  assert.equal(planFor(claims({ trialStart: Date.now() - 8 * 86400_000 })).tier, "free");
  assert.equal(planFor(claims({ trialStart: Date.now() - 80 * 86400_000, email: "VIP@example.com" })).tier, "pro"); // allowlist is case-insensitive
  assert.equal(planFor(claims({ trialStart: null })).tier, "free");
});

test("authorize: sign-in, plan and daily limits are enforced", async () => {
  // no cookie
  const none = await authorize(await reqWith(null), "parse");
  assert.equal(none.ok, false);
  if (!none.ok) assert.equal(none.response.status, 401);

  // a trial user may use Pro routes
  const trial = await authorize(await reqWith(claims()), "photo");
  assert.equal(trial.ok, true);

  // an expired user is Free: Pro routes are 403
  const expired = claims({ trialStart: Date.now() - 9 * 86400_000, sub: "free1" });
  for (const kind of ["photo", "recipe", "insights", "plan"] as const) {
    const r = await authorize(await reqWith(expired), kind);
    assert.equal(r.ok, false, kind);
    if (!r.ok) {
      assert.equal(r.response.status, 403);
      assert.equal((await r.response.json()).code, "pro_required");
    }
  }

  // a Free user gets 8 AI-read meals a day, counted only when committed
  for (let i = 0; i < 8; i++) {
    const r = await authorize(await reqWith(expired), "parse");
    assert.equal(r.ok, true, `call ${i + 1}`);
    if (r.ok) r.commit();
  }
  const ninth = await authorize(await reqWith(expired), "parse");
  assert.equal(ninth.ok, false);
  if (!ninth.ok) {
    assert.equal(ninth.response.status, 429);
    assert.equal((await ninth.response.json()).code, "limit");
  }
  // another user is unaffected
  assert.equal((await authorize(await reqWith({ ...expired, sub: "free2" }), "parse")).ok, true);

  // a call that was authorized but never committed (the AI failed) does not use up the cap
  const fresh = claims({ trialStart: Date.now() - 9 * 86400_000, sub: "free3" });
  for (let i = 0; i < 20; i++) assert.equal((await authorize(await reqWith(fresh), "parse")).ok, true);
});

test("authorize in open mode lets everyone in", async () => {
  const keep = process.env.GOOGLE_CLIENT_SECRET;
  delete process.env.GOOGLE_CLIENT_SECRET;
  const r = await authorize(new Request("http://localhost/api/x", { headers: { "x-forwarded-for": "1.2.3.4" } }), "photo");
  assert.equal(r.ok, true);
  process.env.GOOGLE_CLIENT_SECRET = keep;
});
