/**
 * POST: vota pregunta (body: delta: 1 | -1).
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
    const body = await req.json();
    const delta = body.delta === -1 ? -1 : 1;
    const { voted } = await questions.votePost(lessonId, postId, auth.uid, delta);
    return NextResponse.json({ ok: true, voted });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
