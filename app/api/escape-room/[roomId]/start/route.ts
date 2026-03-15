/**
 * POST: iniciar escape room (crear progreso).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode } from "@/lib/env";
import * as escapeRoom from "@/lib/services/escapeRoom";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  try {
    const auth = await getAuthFromRequest(_req);
    const room = getDemoMode() ? escapeRoom.getDemoEscapeRoom() : await escapeRoom.getEscapeRoom(roomId);
    if (!room) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    const progress = await escapeRoom.startEscapeRoom(auth.uid, roomId);
    return NextResponse.json({ progress, room });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
  }
}
