import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken, MERCHANT_SESSION_COOKIE_NAME, verifyRoleSessionToken } from "./lib/auth";

export async function middleware(req: NextRequest) {
  // Let the login pages themselves through.
  if (req.nextUrl.pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }
  if (req.nextUrl.pathname.startsWith("/merchant/login")) {
    return NextResponse.next();
  }

  if (req.nextUrl.pathname.startsWith("/merchant")) {
    const token = req.cookies.get(MERCHANT_SESSION_COOKIE_NAME)?.value;
    const payload = await verifyRoleSessionToken(token);
    if (!payload || payload.role !== "merchant") {
      const loginUrl = new URL("/merchant/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const valid = await verifySessionToken(token);

  if (!valid) {
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/merchant/:path*"],
};
