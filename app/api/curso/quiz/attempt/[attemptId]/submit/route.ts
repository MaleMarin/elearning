import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as quizService from "@/lib/services/quiz";
import { trackQuizAnswered } from "@/lib/xapi/statements";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params;
  if (!attemptId) return NextResponse.json({ error: "attemptId requerido" }, { status: 400 });
  if (getDemoMode()) {
    return NextResponse.json({
      score: 80,
      passed: true,
      attempt: { score: 80, passed: true, completedAt: new Date().toISOString() },
      questions: [{ id: "q1", question: "Pregunta 1", correctAnswer: "B", explanation: "Correcto.", userAnswer: "B" }],
    });
  }
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const answers = body.answers && typeof body.answers === "object" ? body.answers as Record<string, string | number> : {};
    const result = await quizService.submitAttempt(auth.uid, attemptId, answers);
    if (!result) return NextResponse.json({ error: "Intento no encontrado o ya completado" }, { status: 400 });
    const questionsForClient = result.questions.map((q) => ({
      id: q.id,
      question: q.question,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      userAnswer: result.attempt.answers[q.id],
    }));

    for (const q of result.questions) {
      const userAnswer = result.attempt.answers[q.id];
      const response = userAnswer != null ? String(userAnswer) : "";
      const correctVal = Array.isArray(q.correctAnswer)
        ? (q.correctAnswer as unknown[]).map(String)
        : [String(q.correctAnswer)];
      const isCorrect = correctVal.includes(response);
      trackQuizAnswered(auth.uid, q.id, isCorrect, response);
    }

    return NextResponse.json({
      score: result.score,
      passed: result.passed,
      attempt: { score: result.attempt.score, passed: result.attempt.passed, completedAt: result.attempt.completedAt },
      questions: questionsForClient,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
  }
}
