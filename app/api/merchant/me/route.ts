import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "../../../../lib/auth";
import { getMerchantById, toMerchantPublic } from "../../../../lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await requireMerchant(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const merchant = await getMerchantById(session.merchantId!);
  if (!merchant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({ merchant: toMerchantPublic(merchant) });
}
