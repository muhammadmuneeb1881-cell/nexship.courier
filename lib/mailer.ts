import nodemailer from "nodemailer";
import type { Inquiry, Order, SupportTicket } from "./store";

const ADMIN_EMAIL = process.env.EMAIL_TO || "nexship.courier@gmail.com";

/**
 * Builds a Nodemailer transporter from environment variables.
 * Prefers explicit SMTP settings (SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS),
 * which work with any provider (Gmail, Hostinger, Zoho, SendGrid SMTP, etc.).
 * Falls back to the original Gmail-shorthand config (EMAIL_USER/EMAIL_PASS)
 * for backward compatibility with existing deployments.
 */
function getTransporter() {
  const smtpHost = process.env.SMTP_HOST;

  if (smtpHost) {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    if (!smtpUser || !smtpPass) return null;

    const port = Number(process.env.SMTP_PORT) || 587;
    return nodemailer.createTransport({
      host: smtpHost,
      port,
      secure: process.env.SMTP_SECURE === "true" || port === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });
  }

  // Backward-compatible fallback: existing Gmail-shorthand setup.
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

/** The address notification emails should appear to come "from". */
function getFromAddress(): string {
  const smtpUser = process.env.SMTP_USER;
  const emailUser = process.env.EMAIL_USER;
  return `"NexShip Website" <${smtpUser || emailUser}>`;
}

/**
 * Sends a notification email to the admin inbox whenever a customer submits
 * a plan inquiry / "Talk to Sales" / contact form request.
 * Returns true if the email was sent, false otherwise (e.g. SMTP not configured).
 * Failures here never block saving the inquiry — the admin panel is always
 * the source of truth even if email delivery is temporarily broken.
 */
export async function sendInquiryEmail(inquiry: Inquiry): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(
      "[mailer] EMAIL_USER / EMAIL_PASS not set in .env.local — skipping email send. Inquiry was still saved."
    );
    return false;
  }

  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: ADMIN_EMAIL,
      replyTo: inquiry.email || undefined,
      subject: `New ${inquiry.plan} Inquiry — ${inquiry.name}`,
      text: [
        `New inquiry from the NexShip website.`,
        ``,
        `Plan / Subject: ${inquiry.plan}`,
        `Name: ${inquiry.name}`,
        `Phone: ${inquiry.phone}`,
        `Email: ${inquiry.email || "—"}`,
        `Message: ${inquiry.message || "—"}`,
        ``,
        `Submitted: ${new Date(inquiry.createdAt).toLocaleString()}`,
      ].join("\n"),
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
          <h2 style="color:#0a0a0a;">New ${escapeHtml(inquiry.plan)} Inquiry</h2>
          <table style="width:100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding:6px 0; color:#666;">Name</td><td style="padding:6px 0;"><b>${escapeHtml(inquiry.name)}</b></td></tr>
            <tr><td style="padding:6px 0; color:#666;">Phone</td><td style="padding:6px 0;">${escapeHtml(inquiry.phone)}</td></tr>
            <tr><td style="padding:6px 0; color:#666;">Email</td><td style="padding:6px 0;">${escapeHtml(inquiry.email || "—")}</td></tr>
            <tr><td style="padding:6px 0; color:#666; vertical-align:top;">Message</td><td style="padding:6px 0;">${escapeHtml(inquiry.message || "—")}</td></tr>
          </table>
          <p style="color:#999; font-size:12px; margin-top:16px;">Submitted ${new Date(inquiry.createdAt).toLocaleString()}</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error("[mailer] Failed to send inquiry email:", err);
    return false;
  }
}

/**
 * Sends a notification email to the admin inbox whenever a customer submits
 * a new order through the booking form. Contains all the order details the
 * admin needs to act on it. Returns true if sent, false otherwise (e.g. SMTP
 * not configured). Never throws — a failed email must never block the order
 * from being saved; the admin panel is always the source of truth.
 */
export async function sendOrderNotificationEmail(order: Order): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(
      "[mailer] SMTP not configured (set SMTP_HOST/SMTP_USER/SMTP_PASS or EMAIL_USER/EMAIL_PASS) — skipping order notification email. Order was still saved."
    );
    return false;
  }

  const parcelDetails = `${order.packageType} — ${order.weightKg}kg × ${order.quantity}`;
  const placedAt = new Date(order.createdAt).toLocaleString();

  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: ADMIN_EMAIL,
      subject: `New Order — ${order.trackingId} (${order.senderName})`,
      text: [
        `New order placed on the NexShip website.`,
        ``,
        `Tracking ID: ${order.trackingId}`,
        `Customer Name: ${order.senderName}`,
        `Phone Number: ${order.senderPhone}`,
        `Pickup Address: ${order.pickupAddress}`,
        `Delivery Address: ${order.deliveryAddress} (${order.deliveryCity})`,
        `Parcel Details: ${parcelDetails}`,
        `COD Amount: PKR ${order.price}`,
        `Date & Time: ${placedAt}`,
        ``,
        `Receiver Name: ${order.receiverName}`,
        `Receiver Phone: ${order.receiverPhone}`,
      ].join("\n"),
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
          <h2 style="color:#0a0a0a;">New Order — ${escapeHtml(order.trackingId)}</h2>
          <table style="width:100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding:6px 0; color:#666;">Customer Name</td><td style="padding:6px 0;"><b>${escapeHtml(order.senderName)}</b></td></tr>
            <tr><td style="padding:6px 0; color:#666;">Phone Number</td><td style="padding:6px 0;">${escapeHtml(order.senderPhone)}</td></tr>
            <tr><td style="padding:6px 0; color:#666; vertical-align:top;">Pickup Address</td><td style="padding:6px 0;">${escapeHtml(order.pickupAddress)}</td></tr>
            <tr><td style="padding:6px 0; color:#666; vertical-align:top;">Delivery Address</td><td style="padding:6px 0;">${escapeHtml(order.deliveryAddress)} (${escapeHtml(order.deliveryCity)})</td></tr>
            <tr><td style="padding:6px 0; color:#666;">Parcel Details</td><td style="padding:6px 0;">${escapeHtml(parcelDetails)}</td></tr>
            <tr><td style="padding:6px 0; color:#666;">COD Amount</td><td style="padding:6px 0;"><b style="color:#D60000;">PKR ${order.price}</b></td></tr>
            <tr><td style="padding:6px 0; color:#666;">Date &amp; Time</td><td style="padding:6px 0;">${escapeHtml(placedAt)}</td></tr>
          </table>
          <p style="color:#999; font-size:12px; margin-top:16px;">Receiver: ${escapeHtml(order.receiverName)} · ${escapeHtml(order.receiverPhone)}</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error("[mailer] Failed to send order notification email:", err);
    return false;
  }
}

/**
 * Sends a booking confirmation email to the CUSTOMER (order.senderEmail)
 * every time they place a new order through the booking form. Returns true
 * if sent, false otherwise (e.g. SMTP not configured or no email on the
 * order). Never throws — a failed email must never block the order from
 * being saved.
 */
export async function sendOrderConfirmationEmail(order: Order): Promise<boolean> {
  if (!order.senderEmail || !order.senderEmail.trim()) {
    return false;
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.warn(
      "[mailer] SMTP not configured — skipping customer confirmation email. Order was still saved."
    );
    return false;
  }

  const parcelDetails = `${order.packageType} — ${order.weightKg}kg × ${order.quantity}`;
  const placedAt = new Date(order.createdAt).toLocaleString();

  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: order.senderEmail,
      replyTo: ADMIN_EMAIL,
      subject: `Booking Confirmed — ${order.trackingId} | NexShip Courier`,
      text: [
        `Hi ${order.senderName},`,
        ``,
        `Thanks for booking with NexShip! Your order has been received and is being processed.`,
        ``,
        `Tracking ID: ${order.trackingId}`,
        `Pickup Address: ${order.pickupAddress}`,
        `Receiver: ${order.receiverName} (${order.receiverPhone})`,
        `Delivery Address: ${order.deliveryAddress} (${order.deliveryCity})`,
        `Parcel Details: ${parcelDetails}`,
        `COD Amount: PKR ${order.price}`,
        `Date & Time: ${placedAt}`,
        ``,
        `You can track your order anytime using the Tracking ID above on our website.`,
        ``,
        `— NexShip Courier`,
      ].join("\n"),
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
          <h2 style="color:#0a0a0a;">Booking Confirmed 🎉</h2>
          <p style="font-size:14px; color:#333;">Hi ${escapeHtml(order.senderName)}, thanks for booking with NexShip! Your order has been received and is being processed.</p>
          <table style="width:100%; border-collapse: collapse; font-size: 14px; margin-top:12px;">
            <tr><td style="padding:6px 0; color:#666;">Tracking ID</td><td style="padding:6px 0;"><b style="color:#00A86B;">${escapeHtml(order.trackingId)}</b></td></tr>
            <tr><td style="padding:6px 0; color:#666; vertical-align:top;">Pickup Address</td><td style="padding:6px 0;">${escapeHtml(order.pickupAddress)}</td></tr>
            <tr><td style="padding:6px 0; color:#666;">Receiver</td><td style="padding:6px 0;">${escapeHtml(order.receiverName)} (${escapeHtml(order.receiverPhone)})</td></tr>
            <tr><td style="padding:6px 0; color:#666; vertical-align:top;">Delivery Address</td><td style="padding:6px 0;">${escapeHtml(order.deliveryAddress)} (${escapeHtml(order.deliveryCity)})</td></tr>
            <tr><td style="padding:6px 0; color:#666;">Parcel Details</td><td style="padding:6px 0;">${escapeHtml(parcelDetails)}</td></tr>
            <tr><td style="padding:6px 0; color:#666;">COD Amount</td><td style="padding:6px 0;"><b style="color:#D60000;">PKR ${order.price}</b></td></tr>
            <tr><td style="padding:6px 0; color:#666;">Date &amp; Time</td><td style="padding:6px 0;">${escapeHtml(placedAt)}</td></tr>
          </table>
          <p style="color:#999; font-size:12px; margin-top:16px;">Save this Tracking ID to check your delivery status anytime on our website.</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error("[mailer] Failed to send customer confirmation email:", err);
    return false;
  }
}

/**
 * Sends a notification email to the support inbox whenever someone submits
 * a support ticket (Support Center → Create Ticket). Never blocks ticket
 * creation — the ticket is always saved to the database regardless of
 * whether this email succeeds.
 */
export async function sendSupportTicketEmail(ticket: SupportTicket): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[mailer] SMTP not configured — skipping support ticket email. Ticket was still saved.");
    return false;
  }

  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: ADMIN_EMAIL,
      replyTo: ticket.email,
      subject: `New Support Ticket — ${ticket.subject}`,
      text: [
        `New support ticket submitted on the NexShip website.`,
        ``,
        `From: ${ticket.name} <${ticket.email}>`,
        `Phone: ${ticket.phone || "—"}`,
        `Subject: ${ticket.subject}`,
        `Message: ${ticket.message}`,
        ``,
        `Submitted: ${new Date(ticket.createdAt).toLocaleString()}`,
      ].join("\n"),
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
          <h2 style="color:#0a0a0a;">New Support Ticket</h2>
          <table style="width:100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding:6px 0; color:#666;">From</td><td style="padding:6px 0;"><b>${escapeHtml(ticket.name)}</b> (${escapeHtml(ticket.email)})</td></tr>
            <tr><td style="padding:6px 0; color:#666;">Phone</td><td style="padding:6px 0;">${escapeHtml(ticket.phone || "—")}</td></tr>
            <tr><td style="padding:6px 0; color:#666;">Subject</td><td style="padding:6px 0;">${escapeHtml(ticket.subject)}</td></tr>
            <tr><td style="padding:6px 0; color:#666; vertical-align:top;">Message</td><td style="padding:6px 0;">${escapeHtml(ticket.message)}</td></tr>
          </table>
          <p style="color:#999; font-size:12px; margin-top:16px;">Submitted ${new Date(ticket.createdAt).toLocaleString()}</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error("[mailer] Failed to send support ticket email:", err);
    return false;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
