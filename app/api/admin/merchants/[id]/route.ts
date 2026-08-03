import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../../lib/auth";
import { generateTempPassword, hashPassword } from "../../../../../lib/passwords";
import {
  deleteMerchant,
  getMerchantById,
  toMerchantPublic,
  updateMerchantPassword,
  updateMerchantStatus,
  writeAuditLog,
} from "../../../../../lib/store";

export const dynamic = "force-dynamic";

// PATCH /api/admin/merchants/:id
// body: { action: "suspend" | "activate" } OR { action: "reset-password" }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await requireAdmin(req);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const action = body?.action;

  const existing = await getMerchantById(params.id);
  if (!existing) return NextResponse.json({ error: "Merchant not found" }, { status: 404 });

  if (action === "suspend" || action === "activate") {
    const status = action === "suspend" ? "Suspended" : "Active";
    const updated = await updateMerchantStatus(params.id, status);
    await writeAuditLog({
      actorType: "admin",
      actorLabel: "admin",
      action: `merchant.${action}`,
      target: existing.email,
    });
    return NextResponse.json({ merchant: updated ? toMerchantPublic(updated) : null });
  }

  if (action === "reset-password") {
    const tempPassword = generateTempPassword();
    const passwordHash = await hashPassword(tempPassword);
    const updated = await updateMerchantPassword(params.id, passwordHash);
    await writeAuditLog({
      actorType: "admin",
      actorLabel: "admin",
      action: "merchant.reset_password",
      target: existing.email,
    });
    // Temp password is returned once, here, so the admin can hand it to the
    // merchant — it is never stored or logged in plaintext anywhere.
    return NextResponse.json({
      merchant: updated ? toMerchantPublic(updated) : null,
      tempPassword,
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

// DELETE /api/admin/merchants/:id
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await requireAdmin(req);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await getMerchantById(params.id);
  if (!existing) return NextResponse.json({ error: "Merchant not found" }, { status: 404 });

  const deleted = await deleteMerchant(params.id);
  if (!deleted) return NextResponse.json({ error: "Merchant not found" }, { status: 404 });

  await writeAuditLog({
    actorType: "admin",
    actorLabel: "admin",
    action: "merchant.delete",
    target: existing.email,
  });

  return NextResponse.json({ success: true });
}
