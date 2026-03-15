import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as quizService from "@/lib/services/quiz";

export const dynamic = "force-dynamic";

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
    const updates: Parameters<typeof quizService.updateQuestion>[1] = {};
    if (typeof body.question === "string") updates.question = body.question;
    if (typeof body.moduleId === "string" || body.moduleId === null) updates.moduleId = body.moduleId;
    if (body.type) updates.type = body.type;
    if (Array.isArray(body.options)) updates.options = body.options;
    if (body.correctAnswer !== undefined) updates.correctAnswer = body.correctAnswer;
    if (typeof body.explanation === "string") updates.explanation = body.explanation;
    if (body.difficulty) updates.difficulty = body.difficulty;
    if (Array.isArray(body.tags)) updates.tags = body.tags;
    await quizService.updateQuestion(id, updates);
    const q = await quizService.getQuestion(id);
    return NextResponse.json(q);
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
    await quizService.deleteQuestion(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
  }
}
