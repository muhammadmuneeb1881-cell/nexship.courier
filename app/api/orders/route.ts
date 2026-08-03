import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireAdmin, requireMerchant } from "../../../lib/auth";
import {
  addOrder,
  calculatePrice,
  createNotification,
  generateTrackingId,
  getOrders,
  Order,
  PACKAGE_TYPES,
} from "../../../lib/store";
import { sendOrderNotificationEmail, sendOrderConfirmationEmail } from "../../../lib/mailer";
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

// POST /api/orders — public booking form. If a merchant is logged in
// (merchant session cookie present), the order is automatically tagged
// with their merchantId so it shows up on their own dashboard.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const {
    senderName,
    senderPhone,
    senderEmail,
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
    senderEmail,
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

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!EMAIL_REGEX.test(senderEmail.trim())) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
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

  // A merchant session (from /merchant login) automatically attaches the
  // order to that merchant's account — the public booking form itself
  // stays unchanged for walk-in / non-merchant customers.
  const merchantSession = await requireMerchant(req);

  const order: Order = {
    id: randomUUID(),
    trackingId,
    createdAt: new Date().toISOString(),
    senderName: senderName.trim(),
    senderPhone: senderPhone.trim(),
    senderEmail: senderEmail.trim(),
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
    merchantId: merchantSession?.merchantId || null,
    codStatus: "Pending",
    codCollectedAt: null,
    codRemittedAt: null,
  };

  await addOrder(order);

  // Notify the admin. Both helpers catch their own errors and resolve to
  // false rather than throwing, so a failed email/WhatsApp send never
  // blocks the order response. They're awaited (not fire-and-forget)
  // because serverless functions can be frozen/terminated right after the
  // response is returned, which would silently drop un-awaited work.
  await Promise.all([
    sendOrderNotificationEmail(order),
    sendOrderConfirmationEmail(order),
    sendOrderWhatsAppNotification(order),
  ]);

  if (order.merchantId) {
    await createNotification({
      recipientType: "merchant",
      merchantId: order.merchantId,
      category: "order",
      title: `Order booked — ${order.trackingId}`,
      message: `Your shipment to ${order.receiverName} (${order.deliveryCity}) has been booked.`,
    }).catch(() => null);
  }

  return NextResponse.json({ order }, { status: 201 });
}
