/**
 * POST /api/progress/uncomplete
 * Body: { courseId, lessonId }. Marca lección como pendiente (idempotente).
 * @see docs/CURSOR_RULES.md — Ticket 3.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseProgress from "@/lib/services/firebase-progress";

export const dynamic = "force-dynamic";

export interface UncompleteBody {
  courseId: string;
  lessonId: string;
}

export interface UncompleteResponse {
  ok: boolean;
  completedLessonIds: string[];
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<UncompleteResponse | { error: string }>> {
  let body: UncompleteBody;
  try {
    body = (await req.json()) as UncompleteBody;
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  const { courseId, lessonId } = body;
  if (!courseId?.trim() || !lessonId?.trim()) {
    return NextResponse.json({ error: "Faltan courseId o lessonId" }, { status: 400 });
  }

  if (getDemoMode()) {
    return NextResponse.json({ ok: true, completedLessonIds: [] });
  }

  if (!useFirebase()) {
    return NextResponse.json({ error: "Progreso no disponible" }, { status: 501 });
  }

  try {
    const auth = await getAuthFromRequest(req);
    const { completedLessonIds } = await firebaseProgress.removeCompletedLesson(
      auth.uid,
      courseId,
      lessonId
    );
    return NextResponse.json({ ok: true, completedLessonIds });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
