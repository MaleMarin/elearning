/**
 * POST /api/progress/complete
 * Body: { courseId, lessonId }. Marca lección como completada (idempotente).
 * @see docs/CURSOR_RULES.md — Ticket 3.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseProgress from "@/lib/services/firebase-progress";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as spacedRepetition from "@/lib/services/spacedRepetition";
import { logAudit } from "@/lib/services/audit-logs";
import { logAudit as logGlobalAudit } from "@/lib/services/audit-log";
import { trackLessonCompleted } from "@/lib/xapi/statements";
import * as points from "@/lib/services/points";
import { getLessonBlocks } from "@/lib/services/lessonBlocks.server";
import { getPlainTextFromBlocks } from "@/lib/services/lessonBlocks";
import {
  getInstitutionIdForUser,
  extractConceptsAndUpdateGraph,
} from "@/lib/services/knowledge-graph";

export const dynamic = "force-dynamic";

export interface CompleteBody {
  courseId: string;
  lessonId: string;
}

export interface CompleteResponse {
  ok: boolean;
  completedLessonIds: string[];
  totalLessons?: number;
  justCompletedAll?: boolean;
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<CompleteResponse | { error: string }>> {
  let body: CompleteBody;
  try {
    body = (await req.json()) as CompleteBody;
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  const { courseId, lessonId } = body;
  if (!courseId?.trim() || !lessonId?.trim()) {
    return NextResponse.json({ error: "Faltan courseId o lessonId" }, { status: 400 });
  }

  if (getDemoMode()) {
    return NextResponse.json({
      ok: true,
      completedLessonIds: [lessonId],
      totalLessons: 1,
      justCompletedAll: false,
    });
  }

  if (!useFirebase()) {
    return NextResponse.json({ error: "Progreso no disponible" }, { status: 501 });
  }

  try {
    const auth = await getAuthFromRequest(req);
    const { completedLessonIds } = await firebaseProgress.addCompletedLesson(
      auth.uid,
      courseId,
      lessonId
    );
    points.addPoints(auth.uid, "lesson_complete", { lessonId, courseId }).catch(() => {});
    const modules = await firebaseContent.getPublishedModules(courseId);
    const moduleIds = modules.map((m) => m.id);
    const lessons = await firebaseContent.getPublishedLessons(moduleIds);
    const lesson = lessons.find((l) => l.id === lessonId);
    spacedRepetition.scheduleReviews(auth.uid, lessonId, lesson?.title ?? null).catch(() => {});
    const totalLessons = lessons.length;
    const publishedIds = new Set(lessons.map((l) => l.id));
    const completedCount = completedLessonIds.filter((id) => publishedIds.has(id)).length;
    const justCompletedAll = totalLessons > 0 && completedCount >= totalLessons;

    if (justCompletedAll) {
      import("@/lib/services/certificate-trigger")
        .then((m) => m.triggerCertificateIfEligible(auth.uid, courseId))
        .catch(() => {});
      import("@/lib/services/enrollment-rules")
        .then((m) => m.checkEnrollmentRules(auth.uid, courseId))
        .catch(() => {});
    }

    trackLessonCompleted(auth.uid, lessonId, lesson?.title ?? lessonId);
    logAudit(auth.uid, "lesson_complete", { lessonId, courseId }).catch(() => {});
    logGlobalAudit({
      userId: auth.uid,
      action: "lesson_completed",
      resourceId: lessonId,
      resourceType: "lesson",
      metadata: { courseId },
    }).catch(() => {});

    // Brecha 6: extraer conceptos y actualizar grafo de conocimiento (en segundo plano)
    (async () => {
      try {
        const fullLesson = await firebaseContent.getLesson(lessonId).catch(() => null);
        if (!fullLesson) return;
        const moduleTitle = fullLesson.module_id
          ? (await firebaseContent.getModule(fullLesson.module_id as string).catch(() => null))?.title as string
          : "";
        const blocks = await getLessonBlocks(lessonId);
        const plainText = blocks.length > 0
          ? getPlainTextFromBlocks(blocks)
          : (fullLesson.content as string) ?? "";
        if (!plainText.trim()) return;
        const institutionId = await getInstitutionIdForUser(auth.uid);
        await extractConceptsAndUpdateGraph(
          plainText,
          auth.uid,
          institutionId,
          lessonId,
          moduleTitle || ""
        );
      } catch {
        // no bloquear la respuesta
      }
    })();

    return NextResponse.json({
      ok: true,
      completedLessonIds,
      totalLessons,
      justCompletedAll,
    });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
