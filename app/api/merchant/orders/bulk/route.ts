import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireMerchant } from "../../../../../lib/auth";
import {
  addOrder,
  calculateOrderAmounts,
  createNotification,
  generateTrackingId,
  Order,
  PACKAGE_TYPES,
} from "../../../../../lib/store";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RawRow {
  [key: string]: string;
}

type ValidatedOrder = Omit<
  Order,
  | "id"
  | "trackingId"
  | "createdAt"
  | "deliveryCharges"
  | "pickupCharges"
  | "price"
  | "status"
  | "merchantId"
  | "codStatus"
  | "codCollectedAt"
  | "codRemittedAt"
>;

function validateRow(row: RawRow, rowNumber: number): { error: string } | { order: ValidatedOrder } {
  const required = [
    "senderName",
    "senderPhone",
    "senderEmail",
    "pickupAddress",
    "receiverName",
    "receiverPhone",
    "deliveryCity",
    "deliveryAddress",
    "packageType",
    "weightKg",
    "quantity",
  ];
  for (const key of required) {
    if (!row[key] || !String(row[key]).trim()) {
      return { error: `Row ${rowNumber}: missing "${key}"` };
    }
  }
  if (!EMAIL_REGEX.test(row.senderEmail.trim())) {
    return { error: `Row ${rowNumber}: invalid sender email` };
  }
  if (!PACKAGE_TYPES.includes(row.packageType.trim())) {
    return {
      error: `Row ${rowNumber}: invalid packageType "${row.packageType}" (expected one of ${PACKAGE_TYPES.join(", ")})`,
    };
  }
  const weight = Number(row.weightKg);
  const qty = Number(row.quantity);
  if (!Number.isFinite(weight) || weight <= 0 || weight > 1000) {
    return { error: `Row ${rowNumber}: invalid weightKg` };
  }
  if (!Number.isInteger(qty) || qty <= 0 || qty > 500) {
    return { error: `Row ${rowNumber}: invalid quantity` };
  }

  // Optional columns — bulk sheets that don't include them default to a
  // Normal/Prepaid booking (no cash collected from the receiver).
  const isCodRaw = (row.isCod ?? row.codType ?? "").toString().trim().toLowerCase();
  const isCod = ["cod", "true", "yes", "1"].includes(isCodRaw);
  let parcelValue = 0;
  if (isCod) {
    parcelValue = Number(row.parcelValue ?? 0);
    if (!Number.isFinite(parcelValue) || parcelValue < 0 || parcelValue > 10_000_000) {
      return { error: `Row ${rowNumber}: invalid parcelValue for a COD booking` };
    }
  }

  // Optional column — bulk sheets that don't include it default to no
  // pickup requested (merchants typically drop bulk shipments off).
  const requiresPickupRaw = (row.requiresPickup ?? row.pickup ?? "").toString().trim().toLowerCase();
  const requiresPickup = ["pickup", "true", "yes", "1"].includes(requiresPickupRaw);

  return {
    order: {
      senderName: row.senderName.trim(),
      senderPhone: row.senderPhone.trim(),
      senderEmail: row.senderEmail.trim(),
      pickupAddress: row.pickupAddress.trim(),
      receiverName: row.receiverName.trim(),
      receiverPhone: row.receiverPhone.trim(),
      deliveryCity: row.deliveryCity.trim(),
      deliveryAddress: row.deliveryAddress.trim(),
      packageType: row.packageType.trim(),
      weightKg: weight,
      quantity: qty,
      isCod,
      parcelValue,
      requiresPickup,
    },
  };
}

// POST /api/merchant/orders/bulk — merchant only.
// body: { rows: RawRow[], dryRun?: boolean }
// dryRun=true only validates and returns errors, without creating anything.
export async function POST(req: NextRequest) {
  const session = await requireMerchant(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.rows)) {
    return NextResponse.json({ error: "Expected { rows: [...] }" }, { status: 400 });
  }
  const rows: RawRow[] = body.rows;
  const dryRun = Boolean(body.dryRun);

  if (rows.length === 0) {
    return NextResponse.json({ error: "No rows to import" }, { status: 400 });
  }
  if (rows.length > 500) {
    return NextResponse.json({ error: "Maximum 500 rows per bulk import" }, { status: 400 });
  }

  const errors: string[] = [];
  const validated: { order: ValidatedOrder }[] = [];

  rows.forEach((row, idx) => {
    const result = validateRow(row, idx + 2); // +2: header row + 1-indexing
    if ("error" in result) {
      errors.push(result.error);
    } else {
      validated.push(result);
    }
  });

  if (dryRun) {
    return NextResponse.json({ validCount: validated.length, errorCount: errors.length, errors });
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: "Fix validation errors before importing", errors }, { status: 400 });
  }

  const created: Order[] = [];
  for (const { order: partial } of validated) {
    const { deliveryCharges, parcelValue, pickupCharges, total: price } = await calculateOrderAmounts({
      weightKg: partial.weightKg,
      quantity: partial.quantity,
      packageType: partial.packageType,
      isCod: partial.isCod,
      parcelValue: partial.parcelValue,
      requiresPickup: partial.requiresPickup,
    });
    const trackingId = await generateTrackingId();
    const order: Order = {
      ...partial,
      id: randomUUID(),
      trackingId,
      createdAt: new Date().toISOString(),
      deliveryCharges,
      parcelValue,
      pickupCharges,
      price,
      status: "Pending",
      merchantId: session.merchantId!,
      codStatus: "Pending",
      codCollectedAt: null,
      codRemittedAt: null,
    };
    await addOrder(order);
    created.push(order);
  }

  await createNotification({
    recipientType: "merchant",
    merchantId: session.merchantId!,
    category: "order",
    title: `Bulk import complete`,
    message: `${created.length} order${created.length === 1 ? "" : "s"} booked via bulk upload.`,
  }).catch(() => null);

  return NextResponse.json({ created });
}
