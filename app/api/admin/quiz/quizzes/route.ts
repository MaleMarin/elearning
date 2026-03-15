import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as quizService from "@/lib/services/quiz";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json([
      { id: "quiz1", courseId: "c1", title: "Quiz Módulo 1", questionCount: 5, passingScore: 60, timeLimit: 10, maxAttempts: 2, moduleId: "m1", createdAt: "", updatedAt: "" },
    ]);
  }
  if (!useFirebase()) return NextResponse.json([]);
  try {
    await getAuthFromRequest(req);
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId") ?? undefined;
    const list = await quizService.listQuizzes(courseId);
    return NextResponse.json(list);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
  }
}

export async function POST(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ id: "demo-quiz", title: "Demo Quiz", courseId: "c1", questionCount: 3, passingScore: 60, timeLimit: 0, randomizeQuestions: true, randomizeOptions: true, maxAttempts: 0, showExplanations: true, moduleId: null, createdAt: "", updatedAt: "" });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    await getAuthFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const courseId = typeof body.courseId === "string" ? body.courseId : "";
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const questionCount = Math.max(1, Number(body.questionCount) || 5);
    const passingScore = Math.min(100, Math.max(0, Number(body.passingScore) || 60));
    const timeLimit = Math.max(0, Number(body.timeLimit) || 0);
    const maxAttempts = Math.max(0, Number(body.maxAttempts) || 0);
    const randomizeQuestions = body.randomizeQuestions !== false;
    const randomizeOptions = body.randomizeOptions !== false;
    const showExplanations = body.showExplanations !== false;
    const moduleId = typeof body.moduleId === "string" ? body.moduleId : null;
    if (!courseId || !title) return NextResponse.json({ error: "courseId y title requeridos" }, { status: 400 });
    const quiz = await quizService.createQuiz({
      courseId,
      title,
      questionCount,
      passingScore,
      timeLimit,
      randomizeQuestions,
      randomizeOptions,
      maxAttempts,
      showExplanations,
      moduleId,
    });
    return NextResponse.json(quiz);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
  }
}
