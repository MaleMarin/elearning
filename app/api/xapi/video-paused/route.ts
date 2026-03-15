/**
 * POST /api/xapi/video-paused
 * Body: { lessonId, secondsPaused }. Envía statement xAPI "paused".
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { trackVideoPaused } from "@/lib/xapi/statements";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const lessonId = body.lessonId?.trim();
    const secondsPaused = typeof body.secondsPaused === "number" ? body.secondsPaused : 0;
    if (!lessonId) return NextResponse.json({ error: "lessonId requerido" }, { status: 400 });
    trackVideoPaused(auth.uid, lessonId, Math.max(0, secondsPaused));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
