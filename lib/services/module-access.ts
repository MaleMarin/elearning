/**
 * Control de acceso a módulos según visibilityMode y progreso del módulo anterior.
 * Usado por la biblioteca de contenido (contenido teórico vs ejercicios).
 */

import * as firebaseContent from "@/lib/services/firebase-content";
import * as firebaseProgress from "@/lib/services/firebase-progress";
import type { VisibilityMode } from "@/lib/types/module-content";

export interface ModuleAccessResult {
  canAccess: boolean;
  canSeeContent: boolean;
  canSeeExercises: boolean;
  reason: string;
}

/**
 * Determina qué puede ver el alumno en un módulo según:
 * - visibilityMode (locked | preview | full)
 * - Si completó el módulo anterior (todas las lecciones).
 */
export async function canAccessModule(
  userId: string,
  moduleId: string,
  courseId: string
): Promise<ModuleAccessResult> {
  const module = await firebaseContent.getModule(moduleId).catch(() => null);
  if (!module) {
    return {
      canAccess: false,
      canSeeContent: false,
      canSeeExercises: false,
      reason: "Módulo no encontrado",
    };
  }

  const prevModule = await firebaseContent.getPreviousModule(courseId, moduleId);
  const prevCompleted = prevModule
    ? await firebaseContent.isModuleCompleted(userId, courseId, prevModule.id as string)
    : true;

  const visibilityMode = (module.visibilityMode as VisibilityMode | undefined) ?? "locked";

  switch (visibilityMode) {
    case "full":
      return {
        canAccess: true,
        canSeeContent: true,
        canSeeExercises: true,
        reason: "Módulo completamente disponible",
      };
    case "preview":
      return {
        canAccess: true,
        canSeeContent: true,
        canSeeExercises: prevCompleted,
        reason: prevCompleted
          ? "Acceso completo"
          : "Completa el módulo anterior para acceder a los ejercicios",
      };
    case "locked":
    default:
      return {
        canAccess: prevCompleted,
        canSeeContent: prevCompleted,
        canSeeExercises: prevCompleted,
        reason: prevCompleted
          ? "Acceso completo"
          : "Completa el módulo anterior para desbloquear",
      };
  }
}

/**
 * Comprueba si el usuario completó todas las lecciones del módulo (para desbloquear quiz).
 */
export async function hasCompletedAllLessons(userId: string, courseId: string, moduleId: string): Promise<boolean> {
  return firebaseContent.isModuleCompleted(userId, courseId, moduleId);
}

/**
 * Obtiene progreso del usuario para un curso (completedLessonIds).
 */
export async function getCompletedLessonIds(userId: string, courseId: string): Promise<string[]> {
  const progress = await firebaseProgress.getProgress(userId, courseId);
  return progress.completedLessonIds;
}
