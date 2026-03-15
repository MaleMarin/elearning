/**
 * GET: datos del escape room y progreso del usuario.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode } from "@/lib/env";
import * as escapeRoom from "@/lib/services/escapeRoom";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  if (getDemoMode()) {
    const room = roomId === "demo-escape" ? escapeRoom.getDemoEscapeRoom() : null;
    return NextResponse.json({ room, progress: null });
  }
  try {
    const auth = await getAuthFromRequest(_req);
    const [room, progress] = await Promise.all([
      escapeRoom.getEscapeRoom(roomId),
      escapeRoom.getProgress(auth.uid, roomId),
    ]);
    if (!room) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json({ room, progress });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
  }
}
