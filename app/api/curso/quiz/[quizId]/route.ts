import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as quizService from "@/lib/services/quiz";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const { quizId } = await params;
  if (!quizId) return NextResponse.json({ error: "quizId requerido" }, { status: 400 });
  if (getDemoMode()) {
    return NextResponse.json({
      quiz: { id: quizId, title: "Quiz demo", questionCount: 3, passingScore: 60, timeLimit: 5, maxAttempts: 2 },
      attemptsLeft: 2,
      canStart: true,
    });
  }
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(_req);
    const quiz = await quizService.getQuiz(quizId);
    if (!quiz) return NextResponse.json({ error: "Quiz no encontrado" }, { status: 404 });
    const attempts = await quizService.getAttempts(auth.uid, quizId);
    const completed = attempts.filter((a) => a.completedAt);
    const attemptsLeft = quiz.maxAttempts === 0 ? 999 : Math.max(0, quiz.maxAttempts - completed.length);
    const lastCompleted = completed[0];
    const canStart = attemptsLeft > 0 && (!lastCompleted || quiz.maxAttempts === 0 || (() => {
      const at = lastCompleted.completedAt;
      if (at == null) return true;
      const next = new Date(at);
      next.setHours(next.getHours() + 24);
      return new Date() >= next;
    })());
    return NextResponse.json({
      quiz: { id: quiz.id, title: quiz.title, questionCount: quiz.questionCount, passingScore: quiz.passingScore, timeLimit: quiz.timeLimit, maxAttempts: quiz.maxAttempts },
      attemptsLeft,
      canStart,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
  }
}
