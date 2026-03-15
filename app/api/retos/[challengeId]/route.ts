/**
 * GET: reto por id (cohorte del usuario) — Brecha 8.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as challenges from "@/lib/services/cohort-challenges";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  try {
    const auth = await getAuthFromRequest(req);
    const { challengeId } = await params;
    if (!challengeId) return NextResponse.json({ error: "challengeId requerido" }, { status: 400 });

    if (getDemoMode()) {
      const demo = {
        id: challengeId,
        cohortId: "demo-cohort",
        titulo: "Reto de cohorte demo",
        descripcion: "Resuelve un problema real de política pública en equipo.",
        fechaInicio: new Date().toISOString(),
        fechaFin: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        estado: "activo",
        criteriosEvaluacion: ["Viabilidad", "Impacto", "Creatividad", "Factibilidad presupuestal"],
        premioDescripcion: "Badge Estratega de Cohorte + mención en certificado",
        equipos: [],
        ganador: null,
        createdAt: new Date().toISOString(),
      };
      return NextResponse.json({ challenge: demo });
    }
    if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
    const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
    if (!enrollment) return NextResponse.json({ error: "No perteneces a una cohorte" }, { status: 403 });
    const challenge = await challenges.getChallenge(enrollment.cohort_id, challengeId);
    if (!challenge) return NextResponse.json({ error: "Reto no encontrado" }, { status: 404 });
    return NextResponse.json({ challenge });
  } catch (e) {
    return NextResponse.json({ error: "Error al obtener reto" }, { status: 500 });
  }
}
