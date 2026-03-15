import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import * as firebaseContent from "@/lib/services/firebase-content";

export const dynamic = "force-dynamic";

async function getDisplayName(uid: string): Promise<string> {
  try {
    const snap = await getFirebaseAdminFirestore().collection("profiles").doc(uid).get();
    return (snap.data()?.full_name as string)?.trim() || "Editor";
  } catch {
    return "Editor";
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (getDemoMode()) return NextResponse.json({ ok: true });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const editableIds = await firebaseContent.getEditableCourseIds(auth.uid, auth.role);
    const { id: courseId } = await params;
    if (!editableIds.includes(courseId)) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    const lessonId = (body.lessonId as string)?.trim();
    if (!lessonId) return NextResponse.json({ error: "Falta lessonId" }, { status: 400 });
    const userName = (body.userName as string)?.trim() || (await getDisplayName(auth.uid));
    await firebaseContent.setLessonEditingLock(courseId, lessonId, auth.uid, userName);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (getDemoMode()) return NextResponse.json({ ok: true });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const editableIds = await firebaseContent.getEditableCourseIds(auth.uid, auth.role);
    const { id: courseId } = await params;
    if (!editableIds.includes(courseId)) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    const lessonId = req.nextUrl.searchParams.get("lessonId")?.trim();
    if (!lessonId) return NextResponse.json({ error: "Falta lessonId" }, { status: 400 });
    await firebaseContent.clearLessonEditingLock(courseId, lessonId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
