import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireAdmin } from "../../../lib/auth";
import { addInquiry, getInquiries, Inquiry } from "../../../lib/store";
import { sendInquiryEmail } from "../../../lib/mailer";

// GET /api/inquiries — admin only, returns every inquiry (newest first)
export async function GET(req: NextRequest) {
  const isAdmin = await requireAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const inquiries = getInquiries();
  return NextResponse.json({ inquiries });
}

// POST /api/inquiries — public, called from Pricing "Get Started"/"Contact Sales",
// the "Talk to Sales" button, and the homepage Contact form.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { plan, name, phone, email, message } = body;

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (typeof phone !== "string" || !phone.trim()) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }

  const inquiry: Inquiry = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    plan: typeof plan === "string" && plan.trim() ? plan.trim() : "General Inquiry",
    name: name.trim(),
    phone: phone.trim(),
    email: typeof email === "string" ? email.trim() : "",
    message: typeof message === "string" ? message.trim() : "",
    status: "New",
    emailSent: false,
  };

  const emailSent = await sendInquiryEmail(inquiry);
  inquiry.emailSent = emailSent;

  await addInquiry(inquiry);

  return NextResponse.json({ inquiry }, { status: 201 });
}
