import { NextRequest, NextResponse } from "next/server";
import { requireAnySession } from "../../../lib/auth";
import { createReturn, createNotification, getOrderById, getReturns } from "../../../lib/store";

export const dynamic = "force-dynamic";

// GET /api/returns — admin sees all, merchant sees only their own
export async function GET(req: NextRequest) {
  const session = await requireAnySession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const returns = await getReturns(session.role === "merchant" ? session.merchantId : undefined);
  return NextResponse.json({ returns });
}

// POST /api/returns — file a return for an order (admin or the owning merchant)
export async function POST(req: NextRequest) {
  const session = await requireAnySession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const orderId = typeof body?.orderId === "string" ? body.orderId : "";
  const reason = typeof body?.reason === "string" ? body.reason.trim() : "";
  const redeliveryRequested = Boolean(body?.redeliveryRequested);
  const redeliveryAddress =
    typeof body?.redeliveryAddress === "string" ? body.redeliveryAddress.trim() : undefined;

  if (!orderId || !reason) {
    return NextResponse.json({ error: "orderId and reason are required" }, { status: 400 });
  }
  if (redeliveryRequested && !redeliveryAddress) {
    return NextResponse.json(
      { error: "redeliveryAddress is required when requesting redelivery" },
      { status: 400 }
    );
  }

  const order = await getOrderById(orderId);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // A merchant may only file a return against their own order.
  if (session.role === "merchant" && order.merchantId !== session.merchantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const record = await createReturn({
    orderId,
    merchantId: order.merchantId,
    reason,
    redeliveryRequested,
    redeliveryAddress,
  });

  await createNotification({
    recipientType: "admin",
    category: "order",
    title: `Return requested — ${order.trackingId}`,
    message: `Reason: ${reason}`,
  }).catch(() => null);

  return NextResponse.json({ return: record }, { status: 201 });
}
