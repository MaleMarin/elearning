/**
 * GET: lista preguntas de la lección (orden: recent | votes).
 * POST: crea una pregunta (body: question).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as questions from "@/lib/services/questions";
import { moderarContenido } from "@/lib/services/moderacion";

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
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;
  if (!lessonId) return NextResponse.json({ error: "Falta lessonId" }, { status: 400 });
  const order = (req.nextUrl.searchParams.get("order") as "recent" | "votes") || "recent";

  if (getDemoMode()) {
    return NextResponse.json({
      posts: [
        { id: "q1", userId: "u1", userName: "María G.", question: "¿Cómo aplico esto en mi municipio?", createdAt: new Date().toISOString(), votes: 2, votadoPor: [], resuelta: false },
        { id: "q2", userId: "u2", userName: "Carlos R.", question: "¿Hay ejemplos de OCDE?", createdAt: new Date(Date.now() - 86400000).toISOString(), votes: 0, votadoPor: [], resuelta: false },
      ],
    });
  }
  if (!useFirebase()) return NextResponse.json({ posts: [] });
  try {
    const posts = await questions.listPosts(lessonId, order);
    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;
  if (!lessonId) return NextResponse.json({ error: "Falta lessonId" }, { status: 400 });
  if (getDemoMode()) {
    return NextResponse.json({ id: "demo-q", userName: "Tú", question: "Pregunta demo", createdAt: new Date().toISOString(), votes: 0 });
  }
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
    if (!enrollment) return NextResponse.json({ error: "Sin cohorte activa" }, { status: 403 });
    const body = await req.json();
    const question = (body.question as string)?.trim();
    if (!question) return NextResponse.json({ error: "Falta question" }, { status: 400 });
    if (question.length < 20) return NextResponse.json({ error: "La pregunta debe tener al menos 20 caracteres" }, { status: 400 });
    const resultado = await moderarContenido(question);
    if (!resultado.aprobado) return NextResponse.json({ error: "El contenido no cumple las normas de la comunidad. " + (resultado.razon || "") }, { status: 400 });
    const userName = await getDisplayName(auth.uid);
    const post = await questions.createPost(lessonId, auth.uid, userName, question);
    return NextResponse.json(post);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
