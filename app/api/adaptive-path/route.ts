/**
 * GET: ruta adaptativa y mapa de competencias para el dashboard.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as firebaseProgress from "@/lib/services/firebase-progress";
import * as evaluation from "@/lib/services/evaluation";
import * as quiz from "@/lib/services/quiz";
import {
  getAdaptivePath,
  getModuleSkills,
  diagnosticLevelFromExperience,
  type AdaptiveResult,
  type ModuleSkill,
} from "@/lib/services/adaptivePath";
import { DEMO_MODULES, DEMO_LESSONS } from "@/lib/supabase/demo-mock";

export const dynamic = "force-dynamic";

export interface AdaptivePathResponse {
  path: AdaptiveResult;
  skills: ModuleSkill[];
  nextStepHref: string | null;
  modules: { id: string; title: string }[];
}

function demoResponse(): AdaptivePathResponse {
  const modules = DEMO_MODULES.map((m) => ({ id: m.id, title: m.title }));
  const moduleIds = modules.map((m) => m.id);
  const lessonsByModule: Record<string, string[]> = {};
  DEMO_LESSONS.forEach((l: { id: string; module_id: string }) => {
    if (!lessonsByModule[l.module_id]) lessonsByModule[l.module_id] = [];
    lessonsByModule[l.module_id].push(l.id);
  });
  moduleIds.forEach((mid) => {
    if (!lessonsByModule[mid]) lessonsByModule[mid] = [];
  });
  const path = getAdaptivePath({
    diagnosticLevel: "unknown",
    moduleIds,
    completedLessonIds: [],
    lessonsByModule,
  });
  const skills = getModuleSkills(modules, lessonsByModule, []);
  const firstLessonId = DEMO_LESSONS[0]?.id;
  return {
    path,
    skills,
    nextStepHref: firstLessonId ? `/curso/lecciones/${firstLessonId}` : "/curso",
    modules,
  };
}

export async function GET(req: NextRequest): Promise<NextResponse<AdaptivePathResponse | { error: string }>> {
  if (getDemoMode()) {
    return NextResponse.json(demoResponse());
  }

  if (!useFirebase()) {
    return NextResponse.json(demoResponse());
  }

  try {
    const auth = await getAuthFromRequest(req);
    const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
    const cohortId = enrollment?.cohort_id ?? null;
    const courseId = await firebaseContent.getPrimaryCourseForCohort(cohortId ?? "");
    if (!courseId) return NextResponse.json(demoResponse());

    const [modules, diagnosticData] = await Promise.all([
      firebaseContent.getPublishedModules(courseId),
      evaluation.getDiagnostic(auth.uid),
    ]);
    const moduleIds = modules.map((m) => m.id);
    const lessons = await firebaseContent.getPublishedLessons(moduleIds);
    const { completedLessonIds } = await firebaseProgress.getProgress(auth.uid, courseId);

    const lessonsByModule: Record<string, string[]> = {};
    moduleIds.forEach((mid) => {
      lessonsByModule[mid] = lessons.filter((l) => l.module_id === mid).map((l) => l.id);
    });

    const quizzes = await quiz.listQuizzes(courseId);
    const moduleIdsWithQuizFailures: string[] = [];
    for (const q of quizzes) {
      if (!q.moduleId) continue;
      const attempts = await quiz.getAttempts(auth.uid, q.id);
      const failedCount = attempts.filter((a) => !a.passed).length;
      if (failedCount >= 2) moduleIdsWithQuizFailures.push(q.moduleId);
    }

    const diagnosticLevel = diagnosticLevelFromExperience(diagnosticData?.answers?.experience);
    const path = getAdaptivePath({
      diagnosticLevel,
      moduleIds,
      completedLessonIds,
      lessonsByModule,
      moduleIdsWithQuizFailures,
    });

    const skills = getModuleSkills(
      modules.map((m) => ({ id: m.id, title: m.title })),
      lessonsByModule,
      completedLessonIds
    );

    let nextStepHref: string | null = null;
    if (path.nextStep.lessonId) {
      nextStepHref = `/curso/lecciones/${path.nextStep.lessonId}`;
    } else if (path.nextStep.moduleId) {
      const firstLessonId = lessonsByModule[path.nextStep.moduleId]?.[0];
      nextStepHref = firstLessonId ? `/curso/lecciones/${firstLessonId}` : "/curso";
    }

    return NextResponse.json({
      path,
      skills,
      nextStepHref,
      modules: modules.map((m) => ({ id: m.id, title: m.title })),
    });
  } catch {
    return NextResponse.json(demoResponse());
  }
}
