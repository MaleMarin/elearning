/**
 * POST: crear equipo en el reto (Brecha 8).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { useFirebase } from "@/lib/env";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as challenges from "@/lib/services/cohort-challenges";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  try {
    const auth = await getAuthFromRequest(req);
    const { challengeId } = await params;
    if (!challengeId) return NextResponse.json({ error: "challengeId requerido" }, { status: 400 });
    if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
    const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
    if (!enrollment) return NextResponse.json({ error: "No perteneces a un grupo" }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    const nombre = typeof body.nombre === "string" ? body.nombre.trim() : "";
    if (!nombre) return NextResponse.json({ error: "Nombre del equipo requerido" }, { status: 400 });
    const team = await challenges.createTeam(enrollment.cohort_id, challengeId, nombre, auth.uid);
    return NextResponse.json({ team });
  } catch (e) {
    return NextResponse.json({ error: "Error al crear equipo" }, { status: 500 });
  }
}
