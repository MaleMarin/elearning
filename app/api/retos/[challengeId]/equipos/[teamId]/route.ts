/**
 * GET: equipo. PATCH: actualizar propuesta (Brecha 8).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { useFirebase } from "@/lib/env";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as challenges from "@/lib/services/cohort-challenges";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ challengeId: string; teamId: string }> }
) {
  try {
    const auth = await getAuthFromRequest(_req);
    const { challengeId, teamId } = await params;
    if (!challengeId || !teamId) return NextResponse.json({ error: "challengeId y teamId requeridos" }, { status: 400 });
    if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
    const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
    if (!enrollment) return NextResponse.json({ error: "No perteneces a una cohorte" }, { status: 403 });
    const team = await challenges.getTeam(enrollment.cohort_id, challengeId, teamId);
    if (!team) return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 });
    return NextResponse.json({ team });
  } catch (e) {
    return NextResponse.json({ error: "Error al obtener equipo" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ challengeId: string; teamId: string }> }
) {
  try {
    const auth = await getAuthFromRequest(req);
    const { challengeId, teamId } = await params;
    if (!challengeId || !teamId) return NextResponse.json({ error: "challengeId y teamId requeridos" }, { status: 400 });
    if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
    const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
    if (!enrollment) return NextResponse.json({ error: "No perteneces a una cohorte" }, { status: 403 });
    const team = await challenges.getTeam(enrollment.cohort_id, challengeId, teamId);
    if (!team) return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 });
    if (!team.miembros.includes(auth.uid)) return NextResponse.json({ error: "No eres miembro del equipo" }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    const propuesta = typeof body.propuesta === "string" ? body.propuesta : team.propuesta;
    await challenges.updateTeamPropuesta(enrollment.cohort_id, challengeId, teamId, propuesta);
    const submit = body.submit === true;
    if (submit) await challenges.submitTeamPropuesta(enrollment.cohort_id, challengeId, teamId);
    const updated = await challenges.getTeam(enrollment.cohort_id, challengeId, teamId);
    return NextResponse.json({ team: updated });
  } catch (e) {
    return NextResponse.json({ error: "Error al actualizar propuesta" }, { status: 500 });
  }
}
