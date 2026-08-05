import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireAdmin, requireMerchant } from "../../../lib/auth";
import {
  addOrder,
  calculateOrderAmounts,
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
    isCod,
    parcelValue,
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

  // COD (Cash on Delivery) vs Normal (Prepaid) booking. Defaults to COD to
  // stay backwards-compatible with any older client that doesn't send it.
  const codBooking = isCod === undefined ? true : Boolean(isCod);
  const rawParcelValue = codBooking ? Number(parcelValue) : 0;
  if (codBooking && (!Number.isFinite(rawParcelValue) || rawParcelValue < 0 || rawParcelValue > 10_000_000)) {
    return NextResponse.json({ error: "Invalid parcel value" }, { status: 400 });
  }

  // Everything below this point talks to Supabase (calculateOrderAmounts,
  // generateTrackingId, requireMerchant, addOrder). If Supabase env vars are
  // missing/wrong, or the `orders` table/migrations aren't set up, these
  // throw. Without a try/catch, Next.js turns that into a bare 500 HTML
  // error page (no JSON body) — which is exactly what makes the booking
  // form show the generic "Could not reach the server" message instead of
  // the real reason. We catch it here, log the full error for ourselves,
  // and return a clear JSON error so both the browser and Vercel logs show
  // what actually went wrong.
  try {
    const { deliveryCharges, parcelValue: codAmount, total: price } = await calculateOrderAmounts({
      weightKg: weight,
      quantity: qty,
      packageType,
      isCod: codBooking,
      parcelValue: rawParcelValue,
    });
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
      deliveryCharges,
      parcelValue: codAmount,
      isCod: codBooking,
      price,
      status: "Pending",
      merchantId: merchantSession?.merchantId || null,
      codStatus: "Pending",
      codCollectedAt: null,
      codRemittedAt: null,
    };

    await addOrder(order);

    // IMPORTANT: the order is already saved above, so it is immediately
    // visible in the merchant/admin dashboards as soon as this request
    // returns — we must NOT make the merchant wait for email/WhatsApp calls.
    // Those can be slow (SMTP/WhatsApp Cloud API round-trips) or even hang,
    // and awaiting them here was exactly what made bookings — and therefore
    // "when does the order show up in my account" — feel very slow/late.
    //
    // We intentionally do NOT await this: it runs in the background while
    // the response below is already on its way to the browser. Every call
    // inside already catches its own errors, so a failed
    // email/WhatsApp/notification send can never throw or crash the server.
    void (async () => {
      await Promise.all([
        sendOrderNotificationEmail(order),
        sendOrderConfirmationEmail(order),
        sendOrderWhatsAppNotification(order),
      ]).catch((err) => console.error("[orders] background notification failed:", err));

      if (order.merchantId) {
        await createNotification({
          recipientType: "merchant",
          merchantId: order.merchantId,
          category: "order",
          title: `Order booked — ${order.trackingId}`,
          message: `Your shipment to ${order.receiverName} (${order.deliveryCity}) has been booked.`,
        }).catch(() => null);
      }
    })();

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    // Full detail goes to the server log (Vercel → Deployments → Logs).
    console.error("[POST /api/orders] failed to create order:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Could not save order: ${message}` },
      { status: 500 }
    );
  }
}
