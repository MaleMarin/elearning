/**
 * POST: unirse a un equipo (Brecha 8).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { useFirebase } from "@/lib/env";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as challenges from "@/lib/services/cohort-challenges";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ challengeId: string; teamId: string }> }
) {
  try {
    const auth = await getAuthFromRequest(_req);
    const { challengeId, teamId } = await params;
    if (!challengeId || !teamId) return NextResponse.json({ error: "challengeId y teamId requeridos" }, { status: 400 });
    if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
    const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
    if (!enrollment) return NextResponse.json({ error: "No perteneces a un grupo" }, { status: 403 });
    const ok = await challenges.joinTeam(enrollment.cohort_id, challengeId, teamId, auth.uid);
    if (!ok) return NextResponse.json({ error: "No se pudo unir al equipo" }, { status: 400 });
    const team = await challenges.getTeam(enrollment.cohort_id, challengeId, teamId);
    return NextResponse.json({ team });
  } catch (e) {
    return NextResponse.json({ error: "Error al unirse" }, { status: 500 });
  }
}
