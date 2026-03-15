/**
 * POST /api/xapi/lesson-started
 * Body: { lessonId, lessonTitle }. Envía statement xAPI "experienced".
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { trackLessonStarted } from "@/lib/xapi/statements";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const lessonId = body.lessonId?.trim();
    const lessonTitle = body.lessonTitle?.trim() ?? lessonId ?? "";
    if (!lessonId) return NextResponse.json({ error: "lessonId requerido" }, { status: 400 });
    trackLessonStarted(auth.uid, lessonId, lessonTitle);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
