import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth";
import { deleteInquiry, updateInquiryStatus, InquiryStatus } from "../../../../lib/store";

const VALID_STATUSES: InquiryStatus[] = ["New", "Contacted", "Closed"];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await requireAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await updateInquiryStatus(params.id, body.status);
  if (!updated) {
    return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  }

  return NextResponse.json({ inquiry: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await requireAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deleted = await deleteInquiry(params.id);
  if (!deleted) {
    return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
