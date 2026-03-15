import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as quizService from "@/lib/services/quiz";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (getDemoMode()) return NextResponse.json({ id: "quiz1", title: "Quiz demo", courseId: "c1", questionCount: 3, passingScore: 60, timeLimit: 0, maxAttempts: 2, moduleId: null, createdAt: "", updatedAt: "" });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    await getAuthFromRequest(_req);
    const { id } = await params;
    const quiz = await quizService.getQuiz(id);
    if (!quiz) return NextResponse.json({ error: "Quiz no encontrado" }, { status: 404 });
    return NextResponse.json(quiz);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (getDemoMode()) return NextResponse.json({ error: "Demo" }, { status: 400 });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    await getAuthFromRequest(req);
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const updates: Parameters<typeof quizService.updateQuiz>[1] = {};
    if (typeof body.title === "string") updates.title = body.title;
    if (typeof body.questionCount === "number") updates.questionCount = body.questionCount;
    if (typeof body.passingScore === "number") updates.passingScore = body.passingScore;
    if (typeof body.timeLimit === "number") updates.timeLimit = body.timeLimit;
    if (typeof body.maxAttempts === "number") updates.maxAttempts = body.maxAttempts;
    if (typeof body.randomizeQuestions === "boolean") updates.randomizeQuestions = body.randomizeQuestions;
    if (typeof body.randomizeOptions === "boolean") updates.randomizeOptions = body.randomizeOptions;
    if (typeof body.showExplanations === "boolean") updates.showExplanations = body.showExplanations;
    if (body.moduleId !== undefined) updates.moduleId = body.moduleId;
    await quizService.updateQuiz(id, updates);
    const quiz = await quizService.getQuiz(id);
    return NextResponse.json(quiz);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (getDemoMode()) return NextResponse.json({ error: "Demo" }, { status: 400 });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    await getAuthFromRequest(_req);
    const { id } = await params;
    await quizService.deleteQuiz(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
  }
}
