/**
 * POST: usar una pista en la sala actual.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode } from "@/lib/env";
import * as escapeRoom from "@/lib/services/escapeRoom";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  try {
    const auth = await getAuthFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const roomIndex = typeof body.roomIndex === "number" ? body.roomIndex : 0;
    const room = getDemoMode() ? escapeRoom.getDemoEscapeRoom() : await escapeRoom.getEscapeRoom(roomId);
    if (!room) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    const result = await escapeRoom.useHint(auth.uid, roomId, roomIndex, room);
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
  }
}
