import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth";
import { getAuditLogs } from "../../../../lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const isAdmin = await requireAdmin(req);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const logs = await getAuditLogs(200);
  return NextResponse.json({ logs });
}
