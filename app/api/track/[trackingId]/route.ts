import { NextRequest, NextResponse } from "next/server";
import { findOrderByTrackingId } from "../../../../lib/store";

export const dynamic = "force-dynamic";

// GET /api/track/NS-XXXXXX — public, used by the customer-facing tracking page.
// Only non-sensitive fields are returned (no phone numbers).
export async function GET(
  req: NextRequest,
  { params }: { params: { trackingId: string } }
) {
  const trackingId = decodeURIComponent(params.trackingId || "").trim();

  if (!trackingId) {
    return NextResponse.json({ error: "Tracking ID is required" }, { status: 400 });
  }

  const order = await findOrderByTrackingId(trackingId);

  if (!order) {
    return NextResponse.json(
      { error: "No order found with this tracking ID." },
      { status: 404, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }

  return NextResponse.json(
    {
      order: {
        trackingId: order.trackingId,
        status: order.status,
        createdAt: order.createdAt,
        packageType: order.packageType,
        weightKg: order.weightKg,
        quantity: order.quantity,
        deliveryCity: order.deliveryCity,
        deliveryAddress: order.deliveryAddress,
        receiverName: order.receiverName,
        price: order.price,
      },
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
