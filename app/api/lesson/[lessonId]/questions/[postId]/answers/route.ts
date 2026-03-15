/**
 * GET: lista respuestas del post.
 * POST: crea respuesta (body: answer).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as questions from "@/lib/services/questions";

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
  { params }: { params: Promise<{ lessonId: string; postId: string }> }
) {
  const { lessonId, postId } = await params;
  if (!lessonId || !postId) return NextResponse.json({ error: "Faltan lessonId o postId" }, { status: 400 });
  if (getDemoMode()) {
    return NextResponse.json({
      answers: [
        { id: "a1", userId: "u2", userName: "Tutor", answer: "Te recomiendo revisar el caso de la OCDE 2022.", isOfficial: true, createdAt: new Date().toISOString(), votes: 1 },
      ],
    });
  }
  if (!useFirebase()) return NextResponse.json({ answers: [] });
  try {
    const answers = await questions.listAnswers(lessonId, postId);
    return NextResponse.json({ answers });
  } catch {
    return NextResponse.json({ answers: [] });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string; postId: string }> }
) {
  const { lessonId, postId } = await params;
  if (!lessonId || !postId) return NextResponse.json({ error: "Faltan lessonId o postId" }, { status: 400 });
  if (getDemoMode()) return NextResponse.json({ id: "demo-a", userName: "Tú", answer: "Respuesta demo", isOfficial: false, createdAt: new Date().toISOString(), votes: 0 });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
    if (!enrollment) return NextResponse.json({ error: "Sin cohorte activa" }, { status: 403 });
    const body = await req.json();
    const answer = (body.answer as string)?.trim();
    if (!answer) return NextResponse.json({ error: "Falta answer" }, { status: 400 });
    const userName = await getDisplayName(auth.uid);
    const post = await questions.getPost(lessonId, postId);
    const created = await questions.createAnswer(lessonId, postId, auth.uid, userName, answer);
    if (post && post.userId !== auth.uid) {
      const { createAnswerNotification } = await import("@/lib/services/question-notifications");
      await createAnswerNotification(post.userId, lessonId, postId, userName);
    }
    return NextResponse.json(created);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
