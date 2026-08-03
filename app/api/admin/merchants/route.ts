import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth";
import { hashPassword } from "../../../../lib/passwords";
import {
  createMerchant,
  getMerchantByEmail,
  getMerchants,
  toMerchantPublic,
  writeAuditLog,
} from "../../../../lib/store";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET /api/admin/merchants — list all merchants (admin only)
export async function GET(req: NextRequest) {
  const isAdmin = await requireAdmin(req);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const merchants = await getMerchants();
  return NextResponse.json({ merchants: merchants.map(toMerchantPublic) });
}

// POST /api/admin/merchants — create a new merchant account (admin only)
export async function POST(req: NextRequest) {
  const isAdmin = await requireAdmin(req);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const { companyName, ownerName, phone, email, ntn, strn, pickupAddress, password } = body;

  const requiredStrings = { companyName, ownerName, phone, email, password };
  for (const [key, value] of Object.entries(requiredStrings)) {
    if (typeof value !== "string" || !value.trim()) {
      return NextResponse.json({ error: `Missing or invalid field: ${key}` }, { status: 400 });
    }
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const existing = await getMerchantByEmail(email.trim());
  if (existing) {
    return NextResponse.json({ error: "A merchant with this email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const merchant = await createMerchant({
    companyName: companyName.trim(),
    ownerName: ownerName.trim(),
    phone: phone.trim(),
    email: email.trim(),
    ntn: typeof ntn === "string" ? ntn.trim() : undefined,
    strn: typeof strn === "string" ? strn.trim() : undefined,
    pickupAddress: typeof pickupAddress === "string" ? pickupAddress.trim() : undefined,
    passwordHash,
  });

  await writeAuditLog({
    actorType: "admin",
    actorLabel: "admin",
    action: "merchant.create",
    target: merchant.email,
  });

  return NextResponse.json({ merchant: toMerchantPublic(merchant) }, { status: 201 });
}
