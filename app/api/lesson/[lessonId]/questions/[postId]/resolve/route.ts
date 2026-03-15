/**
 * POST: marcar pregunta como resuelta / no resuelta (solo autor o admin).
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
    const body = await req.json().catch(() => ({}));
    const resolved = Boolean(body.resolved !== false && body.resolved !== "false");
    const post = await questions.getPost(lessonId, postId);
    if (!post) return NextResponse.json({ error: "Pregunta no encontrada" }, { status: 404 });
    const isAuthor = post.userId === auth.uid;
    const isAdmin = auth.role === "admin";
    if (!isAuthor && !isAdmin) return NextResponse.json({ error: "Solo el autor o un admin puede marcar como resuelta" }, { status: 403 });
    await questions.markResolved(lessonId, postId, resolved);
    return NextResponse.json({ ok: true, resuelta: resolved });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
