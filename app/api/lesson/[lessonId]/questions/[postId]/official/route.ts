/**
 * POST: marca una respuesta como oficial (solo tutor/admin). Body: { answerId, isOfficial: boolean }
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as questions from "@/lib/services/questions";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string; postId: string }> }
) {
  const { lessonId, postId } = await params;
  if (!lessonId || !postId) return NextResponse.json({ error: "Faltan lessonId o postId" }, { status: 400 });
  if (getDemoMode()) return NextResponse.json({ ok: true });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin" && auth.role !== "mentor") return NextResponse.json({ error: "Solo tutor o admin" }, { status: 403 });
    const body = await req.json();
    const answerId = body.answerId as string;
    const isOfficial = body.isOfficial === true;
    if (!answerId) return NextResponse.json({ error: "Falta answerId" }, { status: 400 });
    await questions.setAnswerOfficial(lessonId, postId, answerId, isOfficial);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
