import nodemailer from "nodemailer";
import type { Inquiry } from "./store";

const ADMIN_EMAIL = process.env.EMAIL_TO || "nexship.courier@gmail.com";

function getTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
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
      from: `"NexShip Website" <${process.env.EMAIL_USER}>`,
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
