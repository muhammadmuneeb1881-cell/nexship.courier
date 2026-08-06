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

  // NOTE: these used to be fired in the background (unawaited) so the
  // response wouldn't wait on SMTP. Under Vercel's Fluid compute, the
  // function is frozen right after the response is sent, so that
  // background work often never got the chance to finish — this was why
  // ticket emails weren't arriving even though the code "looked" correct.
  // We now await them before responding (~1s extra, but the email is
  // actually guaranteed to be attempted). Errors are still swallowed so a
  // failed email/notification never breaks ticket submission for the user.
  await createNotification({
    recipientType: "admin",
    category: "system",
    title: `New support ticket — ${subject}`,
    message: `From ${name} (${email})`,
  }).catch((err) => console.error("[support-tickets] admin notification failed:", err));

  await sendSupportTicketEmail(ticket).catch((err) =>
    console.error("[support-tickets] email alert failed:", err)
  );

  return NextResponse.json({ ticket }, { status: 201 });
}
