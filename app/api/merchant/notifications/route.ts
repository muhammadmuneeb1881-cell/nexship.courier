import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "../../../../lib/auth";
import { getNotifications, markAllNotificationsRead } from "../../../../lib/store";

export const dynamic = "force-dynamic";

// GET /api/merchant/notifications — notifications scoped to the logged-in
// merchant ONLY. This is deliberately separate from /api/notifications
// (which is shared between admin + merchant): if an admin is also logged in
// on the same browser, the shared route's requireAnySession() checks the
// admin cookie first and can silently hand back admin notifications (e.g.
// support ticket alerts) to a merchant tab. Using requireMerchant() here
// means only a genuine merchant session cookie is ever accepted.
export async function GET(req: NextRequest) {
  const session = await requireMerchant(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await getNotifications({ role: "merchant", merchantId: session.merchantId! });
  const unreadCount = notifications.filter((n) => !n.read).length;
  return NextResponse.json({ notifications, unreadCount });
}

// PATCH /api/merchant/notifications — { action: "mark-all-read" }
export async function PATCH(req: NextRequest) {
  const session = await requireMerchant(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (body?.action !== "mark-all-read") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  await markAllNotificationsRead({ role: "merchant", merchantId: session.merchantId! });
  return NextResponse.json({ success: true });
}
