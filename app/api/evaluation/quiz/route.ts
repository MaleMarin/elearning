import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as evaluation from "@/lib/services/evaluation";
import * as points from "@/lib/services/points";

export const dynamic = "force-dynamic";

/** POST: enviar respuestas del quiz y guardar resultado (solo una vez) */
export async function POST(req: NextRequest) {
  try {
    if (getDemoMode()) {
      return NextResponse.json({ ok: true, score: 8, total: 10, passed: true });
    }
    if (!useFirebase()) {
      return NextResponse.json({ ok: true, score: 0, total: 10, passed: false });
    }
    const auth = await getAuthFromRequest(req);
    const already = await evaluation.getQuizCompleted(auth.uid);
    if (already) {
      const result = await evaluation.getFinalQuizResult(auth.uid);
      return NextResponse.json({
        ok: true,
        score: result?.score ?? 0,
        total: result?.total ?? 10,
        passed: (result?.score ?? 0) >= 6,
      });
    }
    const body = await req.json();
    const { answers } = body as { answers: Record<string, number> };
    const questions = evaluation.DEFAULT_QUIZ_QUESTIONS;
    let score = 0;
    questions.forEach((q, i) => {
      const userIndex = answers[q.id] ?? answers[`q${i + 1}`];
      if (Number(userIndex) === q.correctIndex) score++;
    });
    const total = questions.length;
    await evaluation.setFinalQuizResult(auth.uid, {
      score,
      total,
      completedAt: new Date().toISOString(),
    });
    if (score >= 6) {
      points.addPoints(auth.uid, "quiz_final_passed").catch(() => {});
    }
    return NextResponse.json({
      ok: true,
      score,
      total,
      passed: score >= 6,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 401 }
    );
  }
}
