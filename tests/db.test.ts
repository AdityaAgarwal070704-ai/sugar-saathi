import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import { dbEnabled, ensureProfile, saveUserData } from "../lib/db";
import { recordUseAsync, resetQuotaForTests, usedTodayAsync } from "../lib/quota";

const realFetch = globalThis.fetch;
beforeEach(() => {
  resetQuotaForTests();
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SECRET_KEY;
});
afterEach(() => {
  globalThis.fetch = realFetch;
});

const configure = () => {
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SECRET_KEY = "sb_secret_test";
};

test("db: off unless both variables are set, and the quota falls back to memory", async () => {
  assert.equal(dbEnabled(), false);
  await recordUseAsync("u1", "parse");
  await recordUseAsync("u1", "parse");
  assert.equal(await usedTodayAsync("u1", "parse"), 2);
});

test("db: quota uses the database when set, and falls back to memory if it can't be reached", async () => {
  configure();
  const calls: string[] = [];
  globalThis.fetch = (async (url: string | URL | Request) => {
    calls.push(String(url));
    return Response.json([{ count: 5 }]);
  }) as typeof fetch;
  assert.equal(await usedTodayAsync("u1", "parse"), 5);
  assert.match(calls[0], /ai_usage\?user_id=eq\.u1&kind=eq\.parse&day=eq\.\d{4}-\d{2}-\d{2}/);
  globalThis.fetch = (async () => {
    throw new Error("network down");
  }) as typeof fetch;
  await recordUseAsync("u1", "parse"); // goes to memory
  assert.equal(await usedTodayAsync("u1", "parse"), 1);
});

test("db: the secret key is sent as apikey, and only a JWT-style key also as a bearer token", async () => {
  configure();
  let seen: Headers | null = null;
  globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    seen = new Headers(init?.headers);
    return Response.json([{ trial_started_at: "2026-10-20T00:00:00Z", pro_until: null }]);
  }) as typeof fetch;
  const p = await ensureProfile("u1", "a@example.com");
  assert.equal(p?.trialStartMs, Date.parse("2026-10-20T00:00:00Z"));
  assert.equal(seen!.get("apikey"), "sb_secret_test");
  assert.equal(seen!.get("authorization"), null);
  process.env.SUPABASE_SECRET_KEY = "eyJhbGciOi.payload.sig";
  await ensureProfile("u1", "a@example.com");
  assert.equal(seen!.get("authorization"), "Bearer eyJhbGciOi.payload.sig");
});

test("db: a save clash is reported as a conflict, not an error", async () => {
  configure();
  globalThis.fetch = (async () => Response.json(null)) as typeof fetch;
  assert.equal(await saveUserData("u1", { v: 1 }, 3), "conflict");
  globalThis.fetch = (async () => Response.json(4)) as typeof fetch;
  assert.equal(await saveUserData("u1", { v: 1 }, 3), 4);
  globalThis.fetch = (async () => new Response("boom", { status: 500 })) as typeof fetch;
  assert.equal(await saveUserData("u1", { v: 1 }, 3), "error");
});
