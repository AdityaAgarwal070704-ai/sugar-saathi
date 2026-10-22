import { NextResponse } from "next/server";
import { COOKIES } from "@/lib/auth/session";

// Signs out. The trial cookie is kept on purpose, so signing out and in again does not restart the trial.
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIES.session);
  return res;
}
