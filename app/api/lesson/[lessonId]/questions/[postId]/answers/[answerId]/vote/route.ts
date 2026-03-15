/**
 * POST: vota respuesta (body: delta: 1 | -1).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as questions from "@/lib/services/questions";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string; postId: string; answerId: string }> }
) {
  const { lessonId, postId, answerId } = await params;
  if (!lessonId || !postId || !answerId) return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  if (getDemoMode()) return NextResponse.json({ ok: true });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    await getAuthFromRequest(req);
    const body = await req.json();
    const delta = body.delta === -1 ? -1 : 1;
    await questions.voteAnswer(lessonId, postId, answerId, delta);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
