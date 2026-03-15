/**
 * POST: destacar post (solo admin). Body: { highlighted: boolean }
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as showTell from "@/lib/services/showTell";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  if (!postId) return NextResponse.json({ error: "Falta postId" }, { status: 400 });
  if (getDemoMode()) return NextResponse.json({ ok: true });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo admin" }, { status: 403 });
    const body = await req.json();
    const cohortId = body.cohortId as string;
    if (!cohortId) return NextResponse.json({ error: "Falta cohortId" }, { status: 400 });
    const highlighted = body.highlighted === true;
    await showTell.setPostHighlighted(cohortId, postId, highlighted);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
