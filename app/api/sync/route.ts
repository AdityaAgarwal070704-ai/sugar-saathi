import { planFor, sessionFromRequest } from "@/lib/auth/server";
import { can } from "@/lib/plan";
import { dbEnabled, deleteUserData, ensureProfile, readUserData, saveUserData } from "@/lib/db";

// The cloud copy of one signed-in user's data (Pro and trial only). The browser keeps working without it:
// this only mirrors what is already on the device. All access is by the signed login cookie, never by an id sent by the client.
const MAX_BYTES = 4_000_000; // Vercel's request limit is 4.5 MB

const noStore = { "Cache-Control": "no-store" };
const reply = (body: Record<string, unknown>, status = 200) => Response.json(body, { status, headers: noStore });

async function gate(request: Request, needPlan = true) {
  if (!dbEnabled()) return { off: reply({ enabled: false }) } as const;
  const claims = await sessionFromRequest(request);
  if (!claims) return { off: reply({ enabled: false, error: "Please sign in to continue.", code: "signin" }, 401) } as const;
  if (needPlan && !can(planFor(claims).tier, "sync")) return { off: reply({ enabled: false, error: "Cloud sync is part of Pro.", code: "pro_required" }, 403) } as const;
  await ensureProfile(claims.sub, claims.email); // the data table points at the profile
  return { userId: claims.sub } as const;
}

export async function GET(request: Request) {
  const g = await gate(request);
  if ("off" in g) return g.off;
  const copy = await readUserData(g.userId);
  if (copy === "error") return reply({ enabled: true, error: "Couldn't reach the cloud copy. Your data on this device is safe." }, 502);
  return reply({ enabled: true, copy });
}

export async function PUT(request: Request) {
  const g = await gate(request);
  if ("off" in g) return g.off;
  const text = await request.text();
  if (text.length > MAX_BYTES) return reply({ enabled: true, error: "Your data is too large to sync. Export a backup and clear old readings." }, 413);
  let body: { data?: unknown; expectedRev?: unknown };
  try {
    body = JSON.parse(text);
  } catch {
    return reply({ enabled: true, error: "Bad request." }, 400);
  }
  const d = body.data as { v?: unknown; meals?: unknown; readings?: unknown } | null;
  if (!d || typeof d !== "object" || d.v !== 1 || !Array.isArray(d.meals) || !Array.isArray(d.readings)) return reply({ enabled: true, error: "Bad request." }, 400);
  const expected = body.expectedRev;
  if (typeof expected !== "number" || !Number.isInteger(expected) || expected < 0) return reply({ enabled: true, error: "Bad request." }, 400);

  const result = await saveUserData(g.userId, body.data, expected);
  if (result === "conflict") return reply({ enabled: true, conflict: true }, 409);
  if (result === "error") return reply({ enabled: true, error: "Couldn't save the cloud copy. Your data on this device is safe." }, 502);
  return reply({ enabled: true, rev: result });
}

// Deleting your own cloud copy is always allowed, on any plan.
export async function DELETE(request: Request) {
  const g = await gate(request, false);
  if ("off" in g) return g.off;
  const ok = await deleteUserData(g.userId);
  return ok ? reply({ enabled: true, deleted: true }) : reply({ enabled: true, error: "Couldn't delete the cloud copy." }, 502);
}
