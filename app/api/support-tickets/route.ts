import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "../../../lib/auth";
import { createNotification, createSupportTicket } from "../../../lib/store";
import { sendSupportTicketEmail } from "../../../lib/mailer";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/support-tickets — public (also picks up merchant id if logged in)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : undefined;
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "name, email, subject and message are required" }, { status: 400 });
  }
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const session = await requireMerchant(req);

  const ticket = await createSupportTicket({
    merchantId: session?.merchantId || null,
    name,
    email,
    phone,
    subject,
    message,
  });

  await createNotification({
    recipientType: "admin",
    category: "system",
    title: `New support ticket — ${subject}`,
    message: `From ${name} (${email})`,
  }).catch(() => null);

  // Best-effort email alert to the support inbox; never blocks the response.
  await sendSupportTicketEmail(ticket).catch(() => null);

  return NextResponse.json({ ticket }, { status: 201 });
}
