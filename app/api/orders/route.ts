import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireAdmin } from "../../../lib/auth";
import { addOrder, calculatePrice, generateTrackingId, getOrders, Order, PACKAGE_TYPES } from "../../../lib/store";
import { sendOrderNotificationEmail } from "../../../lib/mailer";
import { sendOrderWhatsAppNotification } from "../../../lib/whatsapp";

export const dynamic = "force-dynamic";

// GET /api/orders — admin only, returns every order (newest first)
export async function GET(req: NextRequest) {
  const isAdmin = await requireAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orders = await getOrders();
  return NextResponse.json({ orders });
}

// POST /api/orders — public, called from the website's booking form
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const {
    senderName,
    senderPhone,
    pickupAddress,
    receiverName,
    receiverPhone,
    deliveryCity,
    deliveryAddress,
    packageType,
    weightKg,
    quantity,
  } = body;

  const requiredStrings = {
    senderName,
    senderPhone,
    pickupAddress,
    receiverName,
    receiverPhone,
    deliveryCity,
    deliveryAddress,
    packageType,
  };

  for (const [key, value] of Object.entries(requiredStrings)) {
    if (typeof value !== "string" || !value.trim()) {
      return NextResponse.json({ error: `Missing or invalid field: ${key}` }, { status: 400 });
    }
  }

  if (!PACKAGE_TYPES.includes(packageType)) {
    return NextResponse.json({ error: "Invalid package type" }, { status: 400 });
  }

  const weight = Number(weightKg);
  const qty = Number(quantity);

  if (!Number.isFinite(weight) || weight <= 0 || weight > 1000) {
    return NextResponse.json({ error: "Invalid weight" }, { status: 400 });
  }
  if (!Number.isInteger(qty) || qty <= 0 || qty > 500) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }

  const price = await calculatePrice({ weightKg: weight, quantity: qty, packageType });
  const trackingId = await generateTrackingId();

  const order: Order = {
    id: randomUUID(),
    trackingId,
    createdAt: new Date().toISOString(),
    senderName: senderName.trim(),
    senderPhone: senderPhone.trim(),
    pickupAddress: pickupAddress.trim(),
    receiverName: receiverName.trim(),
    receiverPhone: receiverPhone.trim(),
    deliveryCity: deliveryCity.trim(),
    deliveryAddress: deliveryAddress.trim(),
    packageType,
    weightKg: weight,
    quantity: qty,
    price,
    status: "Pending",
  };

  await addOrder(order);

  // Notify the admin. Both helpers catch their own errors and resolve to
  // false rather than throwing, so a failed email/WhatsApp send never
  // blocks the order response. They're awaited (not fire-and-forget)
  // because serverless functions can be frozen/terminated right after the
  // response is returned, which would silently drop un-awaited work.
  await Promise.all([
    sendOrderNotificationEmail(order),
    sendOrderWhatsAppNotification(order),
  ]);

  return NextResponse.json({ order }, { status: 201 });
}
