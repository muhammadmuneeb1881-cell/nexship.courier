import { NextRequest, NextResponse } from "next/server";
import { requireAnySession } from "../../../../lib/auth";
import { markNotificationRead } from "../../../../lib/store";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAnySession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notification = await markNotificationRead(params.id);
  if (!notification) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ notification });
}
