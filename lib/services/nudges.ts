/**
 * Nudges inteligentes según comportamiento del alumno.
 * Canales: in-app (banner/toast), WhatsApp, email (según preferencias).
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { getDemoMode } from "@/lib/env";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as firebaseProgress from "@/lib/services/firebase-progress";
import * as quiz from "@/lib/services/quiz";

export type NudgeType =
  | "inactivity_3d"
  | "module_almost_complete"
  | "streak_at_risk"
  | "quiz_available"
  | "peer_active";

export interface Nudge {
  type: NudgeType;
  title: string;
  message: string;
  ctaLabel?: string;
  ctaHref?: string;
  priority: number; // mayor = más importante
}

const INACTIVITY_DAYS = 3;

/**
 * Calcula nudges para un usuario (in-app).
 */
export async function getNudgesForUser(uid: string): Promise<Nudge[]> {
  if (getDemoMode()) return getDemoNudges();
  const db = getFirebaseAdminFirestore();
  const nudges: Nudge[] = [];

  try {
    const enrollment = await firebaseContent.getActiveEnrollmentForUser(uid);
    const cohortId = enrollment?.cohort_id ?? null;
    const courseId = await firebaseContent.getPrimaryCourseForCohort(cohortId ?? "");
    const userDoc = await db.collection("users").doc(uid).get();
    const userData = userDoc.data() as { lastActiveAt?: string; streakDays?: number; streakDate?: string } | undefined;
    const lastActiveAt = userData?.lastActiveAt ?? null;
    const streakDays = userData?.streakDays ?? 0;
    const streakDate = userData?.streakDate ?? null; // última fecha en que se sumó racha

    if (courseId) {
      const [progress, modules] = await Promise.all([
        firebaseProgress.getProgress(uid, courseId),
        firebaseContent.getPublishedModules(courseId),
      ]);
      const moduleIds = modules.map((m) => m.id);
      const lessons = await firebaseContent.getPublishedLessons(moduleIds);
      const totalLessons = lessons.length;
      const completed = progress.completedLessonIds.filter((id) => lessons.some((l) => l.id === id)).length;

      // Inactividad 3 días
      if (lastActiveAt) {
        const last = new Date(lastActiveAt);
        const now = new Date();
        const daysSince = (now.getTime() - last.getTime()) / (24 * 60 * 60 * 1000);
        if (daysSince >= INACTIVITY_DAYS && totalLessons > completed) {
          const pending = totalLessons - completed;
          nudges.push({
            type: "inactivity_3d",
            title: "Te echamos de menos",
            message: `Tienes ${pending} lección${pending === 1 ? "" : "es"} pendiente${pending === 1 ? "" : "s"}. La siguiente son ~5 min.`,
            ctaLabel: "Continuar",
            ctaHref: "/curso",
            priority: 10,
          });
        }
      }

      // Módulo casi completo
      const lessonsByModule = new Map<string, string[]>();
      lessons.forEach((l) => {
        const list = lessonsByModule.get(l.module_id) ?? [];
        list.push(l.id);
        lessonsByModule.set(l.module_id, list);
      });
      for (const m of modules) {
        const lessonIds = lessonsByModule.get(m.id) ?? [];
        const doneInModule = lessonIds.filter((id) => progress.completedLessonIds.includes(id)).length;
        if (lessonIds.length > 0 && doneInModule === lessonIds.length - 1) {
          nudges.push({
            type: "module_almost_complete",
            title: "Casi terminas el módulo",
            message: `¡Estás a 1 lección de completar "${m.title}"!`,
            ctaLabel: "Ver lección",
            ctaHref: "/curso",
            priority: 8,
          });
          break;
        }
      }

      // Racha en riesgo (hoy no ha sumado y ayer tenía racha)
      const today = new Date().toISOString().slice(0, 10);
      if (streakDays >= 1 && streakDate) {
        const lastStreakDate = new Date(streakDate).toISOString().slice(0, 10);
        const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
        if (lastStreakDate === yesterday && completed < totalLessons) {
          nudges.push({
            type: "streak_at_risk",
            title: "Tu racha termina hoy",
            message: `Tu racha de ${streakDays} día${streakDays === 1 ? "" : "s"} termina hoy. ¿5 minutos ahora?`,
            ctaLabel: "Sí, continuar",
            ctaHref: "/curso",
            priority: 9,
          });
        }
      }

      // Quiz disponible
      const quizzes = await quiz.listQuizzes(courseId);
      for (const q of quizzes) {
        if (!q.moduleId) continue;
        const attempts = await quiz.getAttempts(uid, q.id);
        const passed = attempts.some((a) => a.passed);
        if (!passed && attempts.length < (q.maxAttempts || 999)) {
          nudges.push({
            type: "quiz_available",
            title: "Quiz disponible",
            message: `Ya puedes hacer el quiz del módulo. ¿Lo intentamos?`,
            ctaLabel: "Ir al quiz",
            ctaHref: "/curso",
            priority: 7,
          });
          break;
        }
      }
    }

    // Ordenar por prioridad (mayor primero)
    nudges.sort((a, b) => b.priority - a.priority);
    return nudges;
  } catch {
    return getDemoNudges();
  }
}

function getDemoNudges(): Nudge[] {
  return [
    {
      type: "module_almost_complete",
      title: "Casi terminas el módulo",
      message: "¡Estás a 1 lección de completar el módulo 2!",
      ctaLabel: "Ver lección",
      ctaHref: "/curso",
      priority: 8,
    },
  ];
}

/**
 * Cron: obtiene usuarios que podrían recibir nudges (p. ej. inactivos 3+ días).
 * Útil para enviar por email/WhatsApp en batch.
 */
export async function getUsersForNudgeCron(): Promise<{ uid: string; nudges: Nudge[] }[]> {
  if (getDemoMode()) return [];
  const db = getFirebaseAdminFirestore();
  const usersSnap = await db.collection("users").get();
  const result: { uid: string; nudges: Nudge[] }[] = [];
  for (const doc of usersSnap.docs) {
    const nudges = await getNudgesForUser(doc.id);
    if (nudges.length > 0) result.push({ uid: doc.id, nudges });
  }
  return result;
}
