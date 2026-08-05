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

  let ticket;
  try {
    ticket = await createSupportTicket({
      merchantId: session?.merchantId || null,
      name,
      email,
      phone,
      subject,
      message,
    });
  } catch (err) {
    // Log the real DB error (e.g. missing "support_tickets" table/migration)
    // instead of letting it bubble into a generic 500 HTML page — this is
    // the #1 reason tickets can silently fail to appear in the admin panel.
    console.error("[support-tickets] failed to save ticket:", err);
    return NextResponse.json(
      { error: "Could not save your ticket right now. Please try again in a moment." },
      { status: 500 }
    );
  }

  // Notification + email are best-effort side effects — fired in the
  // background so the ticket form doesn't sit waiting on SMTP. The ticket
  // itself is already saved above, so the admin panel's next fetch of
  // /api/admin/support-tickets will show it right away regardless.
  void (async () => {
    await createNotification({
      recipientType: "admin",
      category: "system",
      title: `New support ticket — ${subject}`,
      message: `From ${name} (${email})`,
    }).catch((err) => console.error("[support-tickets] admin notification failed:", err));

    await sendSupportTicketEmail(ticket).catch((err) =>
      console.error("[support-tickets] email alert failed:", err)
    );
  })();

  return NextResponse.json({ ticket }, { status: 201 });
}
