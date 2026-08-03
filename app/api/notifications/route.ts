import { NextRequest, NextResponse } from "next/server";
import { requireAnySession } from "../../../lib/auth";
import { getNotifications, markAllNotificationsRead } from "../../../lib/store";

export const dynamic = "force-dynamic";

// GET /api/notifications — notification center, scoped to whoever is logged in
export async function GET(req: NextRequest) {
  const session = await requireAnySession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await getNotifications(
    session.role === "admin" ? { role: "admin" } : { role: "merchant", merchantId: session.merchantId! }
  );
  const unreadCount = notifications.filter((n) => !n.read).length;
  return NextResponse.json({ notifications, unreadCount });
}

// PATCH /api/notifications — { action: "mark-all-read" }
export async function PATCH(req: NextRequest) {
  const session = await requireAnySession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (body?.action !== "mark-all-read") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  await markAllNotificationsRead(
    session.role === "admin" ? { role: "admin" } : { role: "merchant", merchantId: session.merchantId! }
  );
  return NextResponse.json({ success: true });
}
