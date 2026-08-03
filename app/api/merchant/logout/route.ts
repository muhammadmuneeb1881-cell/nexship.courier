import { NextResponse } from "next/server";
import { MERCHANT_SESSION_COOKIE_NAME } from "../../../../lib/auth";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(MERCHANT_SESSION_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
