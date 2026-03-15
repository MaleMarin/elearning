/**
 * GET: lista comentarios del post.
 * POST: agrega comentario (body: text, max 200 chars).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as showTell from "@/lib/services/showTell";

export const dynamic = "force-dynamic";

async function getDisplayName(uid: string): Promise<string> {
  try {
    const db = getFirebaseAdminFirestore();
    const snap = await db.collection("profiles").doc(uid).get();
    const name = (snap.data()?.full_name as string)?.trim();
    if (name) return name;
  } catch {
    // ignore
  }
  return "Alumno";
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  if (!postId) return NextResponse.json({ error: "Falta postId" }, { status: 400 });
  if (getDemoMode()) return NextResponse.json({ comments: [] });
  if (!useFirebase()) return NextResponse.json({ comments: [] });
  try {
    const auth = await getAuthFromRequest(req);
    const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
    if (!enrollment) return NextResponse.json({ comments: [] });
    const comments = await showTell.listComments(enrollment.cohort_id, postId);
    return NextResponse.json({ comments });
  } catch {
    return NextResponse.json({ comments: [] });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  if (!postId) return NextResponse.json({ error: "Falta postId" }, { status: 400 });
  if (getDemoMode()) return NextResponse.json({ id: "demo-c", userName: "Tú", text: "Comentario demo", createdAt: new Date().toISOString() });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
    if (!enrollment) return NextResponse.json({ error: "Sin cohorte activa" }, { status: 403 });
    const body = await req.json();
    const text = (body.text as string)?.trim();
    if (!text) return NextResponse.json({ error: "Falta text" }, { status: 400 });
    const userName = await getDisplayName(auth.uid);
    const comment = await showTell.addComment(enrollment.cohort_id, postId, auth.uid, userName, text);
    return NextResponse.json(comment);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
