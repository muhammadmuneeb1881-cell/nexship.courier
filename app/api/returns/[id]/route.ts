import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireAnySession } from "../../../../lib/auth";
import {
  createNotification,
  getOrderById,
  getReturns,
  ReturnStatus,
  setReturnRedelivery,
  updateReturnStatus,
  writeAuditLog,
} from "../../../../lib/store";

export const dynamic = "force-dynamic";

const VALID_STATUSES: ReturnStatus[] = [
  "Requested",
  "Approved",
  "In Transit",
  "Received",
  "Refunded",
  "Rejected",
];

// PATCH /api/returns/:id
// body: { status: ReturnStatus, note?: string }  — admin only
// body: { requestRedelivery: true, redeliveryAddress: string } — admin or owning merchant
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAnySession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  if (body.requestRedelivery) {
    const redeliveryAddress =
      typeof body.redeliveryAddress === "string" ? body.redeliveryAddress.trim() : "";
    if (!redeliveryAddress) {
      return NextResponse.json({ error: "redeliveryAddress is required" }, { status: 400 });
    }
    const record = await setReturnRedelivery(params.id, redeliveryAddress);
    if (!record) return NextResponse.json({ error: "Return not found" }, { status: 404 });
    if (session.role === "merchant" && record.merchantId !== session.merchantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json({ return: record });
  }

  // Status transitions are admin-only.
  const isAdmin = await requireAdmin(req);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const record = await updateReturnStatus(params.id, body.status, body.note);
  if (!record) return NextResponse.json({ error: "Return not found" }, { status: 404 });

  await writeAuditLog({
    actorType: "admin",
    actorLabel: "admin",
    action: "return.status_change",
    target: params.id,
    details: { status: body.status },
  });

  if (record.merchantId) {
    const order = await getOrderById(record.orderId);
    await createNotification({
      recipientType: "merchant",
      merchantId: record.merchantId,
      category: "order",
      title: `Return ${body.status} — ${order?.trackingId || record.orderId}`,
      message: body.note || `Your return request is now "${body.status}".`,
    }).catch(() => null);
  }

  return NextResponse.json({ return: record });
}

// GET a single return (used by both admin and merchant UIs)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAnySession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const all = await getReturns(session.role === "merchant" ? session.merchantId : undefined);
  const record = all.find((r) => r.id === params.id);
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ return: record });
}
