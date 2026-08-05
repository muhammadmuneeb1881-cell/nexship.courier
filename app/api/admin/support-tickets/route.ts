import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth";
import { getSupportTickets } from "../../../../lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const isAdmin = await requireAdmin(req);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const tickets = await getSupportTickets();
    return NextResponse.json({ tickets });
  } catch (err) {
    // Most common cause: the `support_tickets` table/migration
    // (sql/002_platform_features.sql) hasn't been run against this database.
    console.error("[admin/support-tickets] failed to load tickets:", err);
    return NextResponse.json(
      { error: "Could not load support tickets. Check server logs — the support_tickets table may be missing." },
      { status: 500 }
    );
  }
}
