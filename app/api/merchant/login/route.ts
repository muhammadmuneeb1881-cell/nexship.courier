import { NextRequest, NextResponse } from "next/server";
import {
  MERCHANT_SESSION_COOKIE_NAME,
  ROLE_SESSION_MAX_AGE_SECONDS,
  createRoleSessionToken,
} from "../../../../lib/auth";
import { getMerchantByEmail, touchMerchantLogin, writeAuditLog } from "../../../../lib/store";
import { verifyPassword } from "../../../../lib/passwords";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const merchant = await getMerchantByEmail(email);
  if (!merchant) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  if (merchant.status === "Suspended") {
    return NextResponse.json(
      { error: "This account has been suspended. Contact NexShip support." },
      { status: 403 }
    );
  }

  const valid = await verifyPassword(password, merchant.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await createRoleSessionToken({ role: "merchant", merchantId: merchant.id });
  await touchMerchantLogin(merchant.id);
  await writeAuditLog({
    actorType: "merchant",
    actorLabel: merchant.companyName,
    action: "merchant.login",
    target: merchant.email,
  });

  const res = NextResponse.json({
    merchant: {
      id: merchant.id,
      companyName: merchant.companyName,
      ownerName: merchant.ownerName,
      email: merchant.email,
    },
  });
  res.cookies.set(MERCHANT_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ROLE_SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
