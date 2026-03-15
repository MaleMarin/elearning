import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as quizService from "@/lib/services/quiz";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const { quizId } = await params;
  if (!quizId) return NextResponse.json({ error: "quizId requerido" }, { status: 400 });
  if (getDemoMode()) {
    return NextResponse.json({
      attemptId: "demo-attempt",
      attempt: { id: "demo-attempt", quizId, questionsServed: ["q1", "q2"], answers: {}, score: 0, passed: false, startedAt: new Date().toISOString(), completedAt: null, attemptNumber: 1 },
      questions: [
        { id: "q1", question: "Pregunta 1?", type: "multiple_choice", options: ["A", "B", "C"], correctAnswer: "B", explanation: "Correcto.", difficulty: "easy", tags: [] },
        { id: "q2", question: "Pregunta 2?", type: "multiple_choice", options: ["X", "Y"], correctAnswer: "X", explanation: "Sí.", difficulty: "easy", tags: [] },
      ],
      quiz: { timeLimit: 5, passingScore: 60, showExplanations: true },
    });
  }
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(_req);
    const result = await quizService.startAttempt(auth.uid, quizId);
    if (!result) return NextResponse.json({ error: "No puedes iniciar este quiz (límite de intentos o sin preguntas)" }, { status: 400 });
    const quiz = await quizService.getQuiz(quizId);
    return NextResponse.json({
      attemptId: result.attempt.id,
      attempt: result.attempt,
      questions: result.questions.map((q) => ({ id: q.id, question: q.question, type: q.type, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation, difficulty: q.difficulty, tags: q.tags })),
      quiz: quiz ? { timeLimit: quiz.timeLimit, passingScore: quiz.passingScore, showExplanations: quiz.showExplanations } : {},
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
  }
}
