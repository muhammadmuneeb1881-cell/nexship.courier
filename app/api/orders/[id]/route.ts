import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth";
import { deleteOrder, updateOrderStatus, OrderStatus } from "../../../../lib/store";

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

  return NextResponse.json({ success: true });
}
