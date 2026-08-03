import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../../lib/auth";
import { TicketStatus, updateSupportTicketStatus, writeAuditLog } from "../../../../../lib/store";

export const dynamic = "force-dynamic";

const VALID: TicketStatus[] = ["Open", "In Progress", "Closed"];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await requireAdmin(req);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || !VALID.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const ticket = await updateSupportTicketStatus(params.id, body.status);
  if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  await writeAuditLog({
    actorType: "admin",
    actorLabel: "admin",
    action: "ticket.status_change",
    target: ticket.subject,
    details: { status: body.status },
  });

  return NextResponse.json({ ticket });
}
