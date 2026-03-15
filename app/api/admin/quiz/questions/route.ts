import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as quizService from "@/lib/services/quiz";
import type { QuestionType, Difficulty } from "@/lib/services/quiz";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json([
      { id: "q1", courseId: "c1", moduleId: "m1", question: "¿Qué es innovación pública?", type: "multiple_choice", options: ["A", "B", "C"], correctAnswer: "B", explanation: "Es B.", difficulty: "medium", tags: [], createdAt: new Date().toISOString() },
    ]);
  }
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    await getAuthFromRequest(req);
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId") ?? undefined;
    const moduleId = searchParams.get("moduleId") ?? undefined;
    const difficulty = (searchParams.get("difficulty") as Difficulty) ?? undefined;
    const tag = searchParams.get("tag") ?? undefined;
    const list = await quizService.listQuestions({ courseId, moduleId: moduleId || null, difficulty, tag });
    return NextResponse.json(list);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
  }
}

export async function POST(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ id: "demo-q", question: "Demo", type: "multiple_choice", options: [], correctAnswer: "", explanation: "", difficulty: "easy", tags: [], createdAt: new Date().toISOString() });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    await getAuthFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const courseId = typeof body.courseId === "string" ? body.courseId : "";
    const moduleId = typeof body.moduleId === "string" ? body.moduleId : null;
    const question = typeof body.question === "string" ? body.question : "";
    const type = (["multiple_choice", "true_false", "short_answer"].includes(body.type) ? body.type : "multiple_choice") as QuestionType;
    const options = Array.isArray(body.options) ? body.options.map(String) : [];
    const correctAnswer = Array.isArray(body.correctAnswer) ? body.correctAnswer.map(String) : String(body.correctAnswer ?? "");
    const explanation = typeof body.explanation === "string" ? body.explanation : "";
    const difficulty = (["easy", "medium", "hard"].includes(body.difficulty) ? body.difficulty : "medium") as Difficulty;
    const tags = Array.isArray(body.tags) ? body.tags.map(String) : [];
    if (!courseId || !question) return NextResponse.json({ error: "courseId y question requeridos" }, { status: 400 });
    const q = await quizService.createQuestion({
      courseId,
      moduleId,
      question,
      type,
      options,
      correctAnswer,
      explanation,
      difficulty,
      tags,
    });
    return NextResponse.json(q);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
  }
}
