import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "../../../../lib/auth";
import { getOrdersByMerchant } from "../../../../lib/store";

export const dynamic = "force-dynamic";

// GET /api/merchant/orders — orders scoped to the logged-in merchant only
export async function GET(req: NextRequest) {
  const session = await requireMerchant(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await getOrdersByMerchant(session.merchantId!);
  return NextResponse.json({ orders });
}
