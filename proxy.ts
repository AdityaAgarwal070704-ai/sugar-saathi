import { NextResponse, type NextRequest } from "next/server";
import { authMode } from "@/lib/auth/config";
import { COOKIES, readSession } from "@/lib/auth/session";

// With login configured, everything under /app needs a valid session. Without it (no Google keys yet), the app stays open.
export async function proxy(request: NextRequest) {
  if (authMode() === "open") return NextResponse.next();
  const session = await readSession(request.cookies.get(COOKIES.session)?.value);
  if (session) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/app/:path*"] };
