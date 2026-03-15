/**
 * GET /api/progress?courseId=...
 * Devuelve completedLessonIds del usuario para el curso.
 * @see docs/CURSOR_RULES.md — Ticket 3.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseProgress from "@/lib/services/firebase-progress";

export const dynamic = "force-dynamic";

export interface ProgressApiResponse {
  completedLessonIds: string[];
}

export async function GET(req: NextRequest): Promise<NextResponse<ProgressApiResponse | { error: string }>> {
  const courseId = req.nextUrl.searchParams.get("courseId") ?? "";
  if (!courseId.trim()) {
    return NextResponse.json({ completedLessonIds: [] });
  }

  if (getDemoMode()) {
    return NextResponse.json({ completedLessonIds: [] });
  }

  if (!useFirebase()) {
    return NextResponse.json({ completedLessonIds: [] });
  }

  try {
    const auth = await getAuthFromRequest(req);
    const { completedLessonIds } = await firebaseProgress.getProgress(auth.uid, courseId);
    return NextResponse.json({ completedLessonIds });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
