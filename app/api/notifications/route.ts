/**
 * GET: notificaciones del usuario (respuestas a mis preguntas).
 * Query: lessonId?, unreadOnly=true
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as questionNotifications from "@/lib/services/question-notifications";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ notifications: [] });
  if (!useFirebase()) return NextResponse.json({ notifications: [] });
  try {
    const auth = await getAuthFromRequest(req);
    const lessonId = req.nextUrl.searchParams.get("lessonId") ?? undefined;
    const unreadOnly = req.nextUrl.searchParams.get("unreadOnly") !== "false";
    const list = await questionNotifications.listByUser(auth.uid, { lessonId, unreadOnly });
    return NextResponse.json({ notifications: list });
  } catch {
    return NextResponse.json({ notifications: [] });
  }
}
