import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../lib/auth";
import { getPricing, setPricing, PricingConfig, PACKAGE_TYPES } from "../../../lib/store";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// GET /api/pricing — public, so the booking form can show a live price estimate
export async function GET() {
  const pricing = await getPricing();
  return NextResponse.json(
    { pricing },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    }
  );
}

// PUT /api/pricing — admin only, lets the admin panel change rates
export async function PUT(req: NextRequest) {
  const isAdmin = await requireAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { baseFee, perKgRate, packageTypeExtra } = body;

  if (typeof baseFee !== "number" || !Number.isFinite(baseFee) || baseFee < 0) {
    return NextResponse.json({ error: "Invalid baseFee" }, { status: 400 });
  }
  if (typeof perKgRate !== "number" || !Number.isFinite(perKgRate) || perKgRate < 0) {
    return NextResponse.json({ error: "Invalid perKgRate" }, { status: 400 });
  }
  if (typeof packageTypeExtra !== "object" || packageTypeExtra === null) {
    return NextResponse.json({ error: "Invalid packageTypeExtra" }, { status: 400 });
  }
  for (const type of PACKAGE_TYPES) {
    if (typeof packageTypeExtra[type] !== "number" || !Number.isFinite(packageTypeExtra[type])) {
      return NextResponse.json({ error: `Invalid extra fee for ${type}` }, { status: 400 });
    }
  }

  const config: PricingConfig = {
    baseFee,
    perKgRate,
    packageTypeExtra,
    updatedAt: new Date().toISOString(),
  };

  await setPricing(config);
  return NextResponse.json({ pricing: config });
}
