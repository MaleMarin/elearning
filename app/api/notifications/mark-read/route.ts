/**
 * POST: marcar notificaciones como leídas.
 * Body: { lessonId?: string } (todas las de esa lección) o { notificationId?: string } (una).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as questionNotifications from "@/lib/services/question-notifications";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ ok: true });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const body = await req.json().catch(() => ({}));
    if (body.lessonId) {
      await questionNotifications.markAllReadForLesson(auth.uid, body.lessonId);
      return NextResponse.json({ ok: true });
    }
    if (body.notificationId) {
      const ok = await questionNotifications.markAsRead(body.notificationId, auth.uid);
      return NextResponse.json({ ok });
    }
    return NextResponse.json({ error: "Falta lessonId o notificationId" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
