/**
 * GET: reto activo de la cohorte del usuario (para sidebar badge) — Brecha 8.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as challenges from "@/lib/services/cohort-challenges";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    if (getDemoMode()) {
      const demoChallenge = {
        id: "demo-challenge",
        cohortId: "demo-cohort",
        titulo: "Reto demo",
        descripcion: "Problema real de política pública",
        fechaInicio: new Date().toISOString(),
        fechaFin: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        estado: "activo",
        criteriosEvaluacion: ["Viabilidad", "Impacto"],
        premioDescripcion: "Badge + mención",
        equipos: [],
        ganador: null,
        createdAt: new Date().toISOString(),
      };
      return NextResponse.json({ challenge: demoChallenge });
    }
    if (!useFirebase()) return NextResponse.json({ challenge: null });
    const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
    if (!enrollment) return NextResponse.json({ challenge: null });
    const challenge = await challenges.getActiveChallengeForCohort(enrollment.cohort_id);
    return NextResponse.json({ challenge });
  } catch {
    return NextResponse.json({ challenge: null });
  }
}
