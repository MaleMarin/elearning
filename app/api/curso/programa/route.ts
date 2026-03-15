/**
 * GET /api/curso/programa
 * Índice del programa completo: todos los módulos con conteos de contenido teórico (sin lecciones ni quizzes).
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as completion from "@/lib/services/completion";
import * as firebaseProgress from "@/lib/services/firebase-progress";
import { parseModuleContent } from "@/lib/services/module-content";
import type { ModuleProgramItem } from "@/components/modules/ModuleProgramView";

export const dynamic = "force-dynamic";

export interface ProgramaApiResponse {
  courseId: string | null;
  courseTitle: string | null;
  modules: ModuleProgramItem[];
}

export async function GET(req: NextRequest): Promise<NextResponse<ProgramaApiResponse | { error: string }>> {
  if (getDemoMode()) {
    return NextResponse.json({
      courseId: "demo-course",
      courseTitle: "Política Digital",
      modules: [
        { id: "m1", order: 1, title: "Innovación pública", description: "Introducción.", bibCount: 3, podcastCount: 2, videoCount: 2, status: "available" },
        { id: "m2", order: 2, title: "Diseño de servicios", description: null, bibCount: 2, podcastCount: 1, videoCount: 1, status: "locked" },
      ],
    });
  }

  if (!useFirebase()) {
    return NextResponse.json({ error: "Backend no disponible" }, { status: 503 });
  }

  try {
    const auth = await getAuthFromRequest(req);
    const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
    const cohortId = enrollment?.cohort_id ?? null;
    if (!cohortId) {
      return NextResponse.json({ courseId: null, courseTitle: null, modules: [] });
    }
    const courseId = await firebaseContent.getPrimaryCourseForCohort(cohortId);
    if (!courseId) {
      return NextResponse.json({ courseId: null, courseTitle: null, modules: [] });
    }
    const course = await firebaseContent.getPublishedCourse(courseId);
    const modules = await firebaseContent.getPublishedModules(courseId);
    const progress = await firebaseProgress.getProgress(auth.uid, courseId).catch(() => ({ completedLessonIds: [] }));
    const moduleAccess = await completion.getModuleAccessMap(
      auth.uid,
      courseId,
      modules.map((m) => m.id),
      progress.completedLessonIds
    );

    const programModules: ModuleProgramItem[] = await Promise.all(
      modules.map(async (m) => {
        const doc = await firebaseContent.getModule(m.id).catch(() => null);
        const content = doc ? parseModuleContent(doc as Record<string, unknown>) : { bibliography: [], podcasts: [], videos: [] };
        const status = (moduleAccess[m.id]?.status ?? "available") as ModuleProgramItem["status"];
        return {
          id: m.id,
          order: m.order_index ?? 0,
          title: m.title,
          description: m.description,
          bibCount: content.bibliography?.length ?? 0,
          podcastCount: content.podcasts?.length ?? 0,
          videoCount: content.videos?.length ?? 0,
          status,
        };
      })
    );

    programModules.sort((a, b) => a.order - b.order);

    return NextResponse.json({
      courseId,
      courseTitle: course?.title ?? null,
      modules: programModules,
    });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
