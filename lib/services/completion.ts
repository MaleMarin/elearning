/**
 * Restricciones de acceso entre m?dulos: lecciones del m?dulo anterior y/o aprobar quiz del anterior.
 */

import * as firebaseContent from "@/lib/services/firebase-content";
import * as firebaseProgress from "@/lib/services/firebase-progress";
import * as quizService from "@/lib/services/quiz";

export type ModuleAccessStatus = "locked" | "available" | "completed";

export interface ModuleAccessResult {
  status: ModuleAccessStatus;
  reason?: string;
}

/**
 * Comprueba si el usuario puede acceder al m?dulo:
 * - requiresCompletion: m?dulos cuyas lecciones deben estar todas completadas.
 * - requiresQuiz: m?dulos cuyo quiz debe estar aprobado (al menos un intento passed).
 */
export async function checkModuleAccess(
  userId: string,
  courseId: string,
  moduleId: string,
  completedLessonIds: string[]
): Promise<ModuleAccessResult> {
  const module = await firebaseContent.getModule(moduleId).catch(() => null);
  if (!module) return { status: "locked", reason: "M?dulo no encontrado" };
  const requiresCompletion = (module.requiresCompletion as string[] | undefined) ?? [];
  const requiresQuiz = (module.requiresQuiz as string[] | undefined) ?? [];

  const moduleLessonIds = await (async () => {
    const lessons = await firebaseContent.getLessons(moduleId);
    return lessons.map((l) => l.id as string);
  })();
  const allModuleLessonsCompleted =
    moduleLessonIds.length > 0 && moduleLessonIds.every((id) => completedLessonIds.includes(id));

  if (allModuleLessonsCompleted) return { status: "completed" };

  for (const reqId of requiresCompletion) {
    const reqLessons = await firebaseContent.getLessons(reqId);
    const reqLessonIds = reqLessons.map((l) => l.id as string);
    const reqComplete =
      reqLessonIds.length > 0 && reqLessonIds.every((id) => completedLessonIds.includes(id));
    if (!reqComplete) {
      const reqMod = await firebaseContent.getModule(reqId).catch(() => null);
      const title = (reqMod?.title as string) ?? "el m?dulo anterior";
      return { status: "locked", reason: `Completa el m?dulo "${title}" para desbloquear` };
    }
  }

  for (const reqModId of requiresQuiz) {
    const quizzes = await quizService.listQuizzes(courseId);
    const quizForModule = quizzes.find((q) => q.moduleId === reqModId);
    if (quizForModule) {
      const attempts = await quizService.getAttempts(userId, quizForModule.id);
      const passed = attempts.some((a) => a.passed);
      if (!passed) {
        const reqMod = await firebaseContent.getModule(reqModId).catch(() => null);
        const title = (reqMod?.title as string) ?? "el m?dulo anterior";
        return { status: "locked", reason: `Aprueba el quiz del m?dulo "${title}" para desbloquear` };
      }
    }
  }

  return { status: "available" };
}

/**
 * Calcula el estado de acceso para todos los m?dulos del curso.
 */
export async function getModuleAccessMap(
  userId: string,
  courseId: string,
  moduleIds: string[],
  completedLessonIds: string[]
): Promise<Record<string, ModuleAccessResult>> {
  const map: Record<string, ModuleAccessResult> = {};
  for (const mid of moduleIds) {
    map[mid] = await checkModuleAccess(userId, courseId, mid, completedLessonIds);
  }
  return map;
}
