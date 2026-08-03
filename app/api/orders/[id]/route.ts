import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth";
import {
  deleteOrder,
  updateOrderStatus,
  OrderStatus,
  createNotification,
  writeAuditLog,
} from "../../../../lib/store";

const VALID_STATUSES: OrderStatus[] = ["Pending", "Picked Up", "In Transit", "Delivered", "Cancelled"];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await requireAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await updateOrderStatus(params.id, body.status);
  if (!updated) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  await writeAuditLog({
    actorType: "admin",
    actorLabel: "admin",
    action: "order.status_change",
    target: updated.trackingId,
    details: { status: body.status },
  });

  // Notify the owning merchant (if this order belongs to one) that its
  // status changed — used to drive the merchant Notification Center.
  if (updated.merchantId) {
    const category = body.status === "Picked Up" ? "pickup" : "order";
    await createNotification({
      recipientType: "merchant",
      merchantId: updated.merchantId,
      category,
      title: `Order ${updated.trackingId} — ${body.status}`,
      message: `Your shipment to ${updated.receiverName} (${updated.deliveryCity}) is now "${body.status}".`,
    }).catch(() => null); // never block the status update on a notification failure
  }

  return NextResponse.json({ order: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await requireAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deleted = await deleteOrder(params.id);
  if (!deleted) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  await writeAuditLog({
    actorType: "admin",
    actorLabel: "admin",
    action: "order.delete",
    target: params.id,
  });

  return NextResponse.json({ success: true });
}
