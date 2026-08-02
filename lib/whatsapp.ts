import type { Order } from "./store";

/**
 * Sends a WhatsApp notification to the admin's number whenever a new order
 * is placed, using Meta's official WhatsApp Cloud API (not an unofficial
 * library). Configure via environment variables — see .env.local.example.
 *
 * IMPORTANT — WhatsApp session window: Meta only allows free-form text
 * messages within a 24-hour window after the recipient last messaged your
 * WhatsApp Business number. If the admin hasn't messaged the business
 * number recently, this call will fail and Meta will require an approved
 * message template instead. To keep this working reliably, have the admin
 * send any message (e.g. "hi") to the WhatsApp Business number periodically,
 * or set up a Meta-approved template message for production use.
 *
 * Returns true if sent, false otherwise. Never throws — a failed WhatsApp
 * notification must never block order creation.
 */
export async function sendOrderWhatsAppNotification(order: Order): Promise<boolean> {
  const token = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_CLOUD_API_PHONE_NUMBER_ID;
  const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;

  if (!token || !phoneNumberId || !adminNumber) {
    console.warn(
      "[whatsapp] WHATSAPP_CLOUD_API_TOKEN / WHATSAPP_CLOUD_API_PHONE_NUMBER_ID / ADMIN_WHATSAPP_NUMBER not set — skipping WhatsApp notification. Order was still saved and emailed."
    );
    return false;
  }

  const message = buildOrderMessage(order);

  try {
    const res = await fetch(
      `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: adminNumber,
          type: "text",
          text: { body: message, preview_url: false },
        }),
      }
    );

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error("[whatsapp] Cloud API request failed:", res.status, errBody);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[whatsapp] Failed to send order WhatsApp notification:", err);
    return false;
  }
}

function buildOrderMessage(order: Order): string {
  const parcelDetails = `${order.packageType} — ${order.weightKg}kg × ${order.quantity}`;
  return [
    `*New Order Received — NexShip*`,
    ``,
    `*Tracking ID:* ${order.trackingId}`,
    `*Customer Name:* ${order.senderName}`,
    `*Phone Number:* ${order.senderPhone}`,
    `*Pickup Address:* ${order.pickupAddress}`,
    `*Delivery Address:* ${order.deliveryAddress} (${order.deliveryCity})`,
    `*Parcel Details:* ${parcelDetails}`,
    `*COD Amount:* PKR ${order.price}`,
    `*Date & Time:* ${new Date(order.createdAt).toLocaleString()}`,
  ].join("\n");
}
