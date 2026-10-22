import { authMode } from "@/lib/auth/config";
import { planFor, sessionFromRequest } from "@/lib/auth/server";

// Tells the browser who is signed in and what plan they have. The session cookie itself is hidden from page scripts.
export async function GET(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  const mode = authMode();
  if (mode === "open") return Response.json({ mode, user: null, plan: null }, { headers });
  const claims = await sessionFromRequest(request);
  if (!claims) return Response.json({ mode, user: null, plan: null }, { headers });
  return Response.json({ mode, user: { id: claims.sub, email: claims.email, name: claims.name, picture: claims.picture }, plan: planFor(claims) }, { headers });
}
