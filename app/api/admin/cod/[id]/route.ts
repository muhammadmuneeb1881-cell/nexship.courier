import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../../lib/auth";
import { createNotification, updateOrderCod, writeAuditLog, CodStatus } from "../../../../../lib/store";

export const dynamic = "force-dynamic";

const VALID: CodStatus[] = ["Pending", "Collected", "Remitted"];

// PATCH /api/admin/cod/:id — body: { codStatus: "Pending" | "Collected" | "Remitted" }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await requireAdmin(req);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || !VALID.includes(body.codStatus)) {
    return NextResponse.json({ error: "Invalid codStatus" }, { status: 400 });
  }

  const order = await updateOrderCod(params.id, body.codStatus);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  await writeAuditLog({
    actorType: "admin",
    actorLabel: "admin",
    action: "order.cod_update",
    target: order.trackingId,
    details: { codStatus: body.codStatus },
  });

  if (order.merchantId && body.codStatus === "Collected") {
    await createNotification({
      recipientType: "merchant",
      merchantId: order.merchantId,
      category: "cod",
      title: `COD collected — ${order.trackingId}`,
      message: `Rs ${order.price.toLocaleString()} cash-on-delivery has been collected for this shipment.`,
    }).catch(() => null);
  }

  return NextResponse.json({ order });
}
