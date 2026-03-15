/**
 * Detección de contenido desactualizado: lecciones sin actualizar en 6+ meses.
 */

import * as firebaseContent from "@/lib/services/firebase-content";

const STALE_MONTHS = 6;

export interface StaleLesson {
  id: string;
  title: string;
  moduleId: string;
  moduleTitle: string;
  updatedAt: string;
}

export async function getStaleLessons(courseId: string): Promise<StaleLesson[]> {
  const modules = await firebaseContent.getModules(courseId);
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - STALE_MONTHS);
  const cutoffIso = cutoff.toISOString();
  const result: StaleLesson[] = [];
  for (const mod of modules) {
    const lessons = await firebaseContent.getLessons(mod.id as string);
    const modTitle = (mod.title as string) ?? "";
    for (const lec of lessons) {
      const updatedAt = (lec.updated_at as string) ?? (lec.created_at as string) ?? "";
      if (updatedAt && updatedAt < cutoffIso) {
        result.push({
          id: lec.id as string,
          title: (lec.title as string) ?? "",
          moduleId: mod.id as string,
          moduleTitle: modTitle,
          updatedAt,
        });
      }
    }
  }
  return result;
}

export async function getAllStaleLessons(): Promise<{ courseId: string; courseTitle: string; lessons: StaleLesson[] }[]> {
  const courses = await firebaseContent.listCourses();
  const out: { courseId: string; courseTitle: string; lessons: StaleLesson[] }[] = [];
  for (const course of courses) {
    const lessons = await getStaleLessons(course.id);
    if (lessons.length > 0) {
      out.push({
        courseId: course.id,
        courseTitle: (course.title as string) ?? "",
        lessons,
      });
    }
  }
  return out;
}
