/**
 * GET: preguntas de la trivia semanal (semana actual).
 * POST: enviar puntaje { score }. Requiere auth; guarda en Firestore por cohorte.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode } from "@/lib/env";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as labTrivia from "@/lib/services/lab-trivia";

export const dynamic = "force-dynamic";

async function getDisplayName(uid: string): Promise<string> {
  const { getFirebaseAdminFirestore } = await import("@/lib/firebase/admin");
  const snap = await getFirebaseAdminFirestore().collection("profiles").doc(uid).get();
  const name = (snap.data()?.full_name as string)?.trim();
  if (name) return name;
  return "Estudiante";
}

export async function GET(req: NextRequest) {
  if (!getDemoMode()) {
    try {
      await getAuthFromRequest(req);
    } catch {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }
  const weekId = labTrivia.getWeekId();
  const questions = await labTrivia.getWeeklyQuestions(weekId);
  return NextResponse.json({ weekId, questions });
}

export async function POST(req: NextRequest) {
  let auth: { uid: string; email: string | null; role: string };
  try {
    auth = await getAuthFromRequest(req);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  let cohortId: string | null = null;
  if (!getDemoMode()) {
    const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
    cohortId = enrollment?.cohort_id ?? null;
    if (!cohortId) return NextResponse.json({ error: "Sin cohorte activa" }, { status: 403 });
  } else {
    cohortId = "demo-cohort-id";
  }
  const body = await req.json().catch(() => ({}));
  const score = typeof body.score === "number" ? Math.max(0, Math.min(5, Math.round(body.score))) : 0;
  const weekId = labTrivia.getWeekId();
  const displayName = getDemoMode() ? "Demo" : await getDisplayName(auth.uid);
  await labTrivia.submitScore(weekId, auth.uid, cohortId, score, displayName);
  return NextResponse.json({ ok: true, weekId, score });
}
