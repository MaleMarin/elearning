/**
 * Capa de contenido con caché (unstable_cache) para escalar a 1,000+ usuarios.
 * Usar en rutas de solo lectura (curso, programa, módulo contenido).
 * Al editar en admin, invalidar con revalidateTag("courses"|"lessons").
 */

import { unstable_cache } from "next/cache";
import * as firebaseContent from "@/lib/services/firebase-content";

const CACHE_REVALIDATE = 3600; // 1 hora

/** Curso por ID (solo publicado). Para lista de cursos usar firebaseContent directo. */
export async function getPublishedCourseCached(courseId: string) {
  return unstable_cache(
    async () => firebaseContent.getPublishedCourse(courseId),
    ["course-published", courseId],
    { revalidate: CACHE_REVALIDATE, tags: ["courses", `course-${courseId}`] }
  )();
}

/** Módulos publicados del curso. */
export async function getPublishedModulesCached(courseId: string) {
  return unstable_cache(
    async () => firebaseContent.getPublishedModules(courseId),
    ["modules-published", courseId],
    { revalidate: CACHE_REVALIDATE, tags: ["courses", `course-${courseId}`] }
  )();
}

/** Lecciones publicadas de una lista de módulos. */
export async function getPublishedLessonsCached(courseId: string, moduleIds: string[]) {
  const key = moduleIds.slice(0, 20).join(",") + (moduleIds.length > 20 ? `+${moduleIds.length}` : "");
  return unstable_cache(
    async () => firebaseContent.getPublishedLessons(moduleIds),
    ["lessons-published", courseId, key],
    { revalidate: CACHE_REVALIDATE, tags: ["lessons", `course-${courseId}`] }
  )();
}

/** Curso completo por ID (cualquier estado). Para admin o cuando no se filtra por published. */
export async function getCourseByIdCached(courseId: string): Promise<Record<string, unknown> | null> {
  return unstable_cache(
    async () => {
      try {
        return await firebaseContent.getCourse(courseId);
      } catch {
        return null;
      }
    },
    ["course-by-id", courseId],
    { revalidate: CACHE_REVALIDATE, tags: ["courses", `course-${courseId}`] }
  )();
}

/** Módulo por ID (cualquier estado). */
export async function getModuleByIdCached(moduleId: string): Promise<Record<string, unknown> | null> {
  return unstable_cache(
    async () => {
      try {
        return await firebaseContent.getModule(moduleId);
      } catch {
        return null;
      }
    },
    ["module-by-id", moduleId],
    { revalidate: CACHE_REVALIDATE, tags: ["modules", `module-${moduleId}`] }
  )();
}

/** Lección por ID (cualquier estado). */
export async function getLessonByIdCached(lessonId: string): Promise<Record<string, unknown> | null> {
  return unstable_cache(
    async () => {
      try {
        return await firebaseContent.getLesson(lessonId);
      } catch {
        return null;
      }
    },
    ["lesson-by-id", lessonId],
    { revalidate: CACHE_REVALIDATE, tags: ["lessons", `lesson-${lessonId}`] }
  )();
}
