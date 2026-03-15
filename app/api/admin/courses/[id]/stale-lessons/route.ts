/**
 * GET: lecciones de este curso con más de 6 meses sin actualizar.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as contentFreshness from "@/lib/services/contentFreshness";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: courseId } = await params;
  if (!courseId) return NextResponse.json({ error: "Falta id" }, { status: 400 });
  if (getDemoMode()) return NextResponse.json({ lessons: [] });
  if (!useFirebase()) return NextResponse.json({ lessons: [] });
  try {
    const auth = await getAuthFromRequest(req);
    const editable = await firebaseContent.getEditableCourseIds(auth.uid, auth.role);
    if (!editable.includes(courseId)) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    const lessons = await contentFreshness.getStaleLessons(courseId);
    return NextResponse.json({ lessons });
  } catch {
    return NextResponse.json({ lessons: [] });
  }
}
