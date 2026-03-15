/**
 * Libro de calificaciones: progreso por lección, quiz, taller y nota final ponderada.
 */

import * as firebaseProgress from "@/lib/services/firebase-progress";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as quizService from "@/lib/services/quiz";
import * as workshop from "@/lib/services/workshop";

export interface GradeItem {
  type: "lesson" | "quiz" | "workshop";
  id: string;
  title: string;
  moduleId: string | null;
  status: "completed" | "pending" | "not_started";
  score?: number | null;
  maxScore?: number | null;
}

export interface StudentGradeSummary {
  userId: string;
  items: GradeItem[];
  finalGrade: number | null;
  progressPercent: number;
}

const WEIGHTS = { lesson: 0.4, quiz: 0.35, workshop: 0.25 };

export async function getStudentGradeSummary(
  userId: string,
  courseId: string
): Promise<StudentGradeSummary> {
  const [progress, modules] = await Promise.all([
    firebaseProgress.getProgress(userId, courseId),
    firebaseContent.getPublishedModules(courseId),
  ]);
  const [lessons, quizzes] = await Promise.all([
    firebaseContent.getPublishedLessons(modules.map((m) => m.id)),
    quizService.listQuizzes(courseId),
  ]);
  const completedSet = new Set(progress.completedLessonIds);
  const items: GradeItem[] = [];
  for (const l of lessons) {
    items.push({
      type: "lesson",
      id: l.id,
      title: l.title,
      moduleId: l.module_id,
      status: completedSet.has(l.id) ? "completed" : "not_started",
      score: completedSet.has(l.id) ? 100 : null,
      maxScore: 100,
    });
  }
  for (const q of quizzes) {
    const attempts = await quizService.getAttempts(userId, q.id);
    const best = attempts.filter((a) => a.completedAt).sort((a, b) => b.score - a.score)[0];
    items.push({
      type: "quiz",
      id: q.id,
      title: q.title,
      moduleId: q.moduleId,
      status: best ? "completed" : "pending",
      score: best?.score ?? null,
      maxScore: 100,
    });
  }
  const workshopsByModule = new Map<string, { id: string; title: string }[]>();
  for (const m of modules) {
    const ws = await workshop.listWorkshopsByModule(m.id);
    workshopsByModule.set(m.id, ws.map((w) => ({ id: w.id, title: w.title })));
  }
  for (const [moduleId, ws] of Array.from(workshopsByModule.entries())) {
    for (const w of ws) {
      const avg = await workshop.getAverageScoreForUser(w.id, userId);
      items.push({
        type: "workshop",
        id: w.id,
        title: w.title,
        moduleId,
        status: avg !== null ? "completed" : "pending",
        score: avg,
        maxScore: 100,
      });
    }
  }
  const withScores = items.filter((i) => i.score != null);
  const totalWeight = WEIGHTS.lesson + WEIGHTS.quiz + WEIGHTS.workshop;
  let finalGrade: number | null = null;
  if (withScores.length > 0) {
    const byType = { lesson: withScores.filter((i) => i.type === "lesson"), quiz: withScores.filter((i) => i.type === "quiz"), workshop: withScores.filter((i) => i.type === "workshop") };
    const lessonAvg = byType.lesson.length ? byType.lesson.reduce((a, i) => a + (i.score ?? 0), 0) / byType.lesson.length : 0;
    const quizAvg = byType.quiz.length ? byType.quiz.reduce((a, i) => a + (i.score ?? 0), 0) / byType.quiz.length : 0;
    const workshopAvg = byType.workshop.length ? byType.workshop.reduce((a, i) => a + (i.score ?? 0), 0) / byType.workshop.length : 0;
    finalGrade = Math.round((lessonAvg * WEIGHTS.lesson + quizAvg * WEIGHTS.quiz + workshopAvg * WEIGHTS.workshop) / totalWeight);
  }
  const progressPercent = lessons.length ? (progress.completedLessonIds.length / lessons.length) * 100 : 0;
  return { userId, items, finalGrade, progressPercent };
}
