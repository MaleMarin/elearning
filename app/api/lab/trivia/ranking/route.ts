/**
 * GET: ranking semanal de la cohorte del usuario.
 * Query: weekId (opcional, por defecto semana actual).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode } from "@/lib/env";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as labTrivia from "@/lib/services/lab-trivia";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let auth: { uid: string };
  try {
    auth = await getAuthFromRequest(req);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  let cohortId: string | null = null;
  if (getDemoMode()) {
    cohortId = "demo-cohort-id";
  } else {
    const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
    cohortId = enrollment?.cohort_id ?? null;
  }
  if (!cohortId) return NextResponse.json({ ranking: [], weekId: null });
  const weekId = req.nextUrl.searchParams.get("weekId") ?? labTrivia.getWeekId();
  const ranking = await labTrivia.getRanking(weekId, cohortId);
  return NextResponse.json({ weekId, ranking });
}
