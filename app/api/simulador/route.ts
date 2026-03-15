/**
 * GET /api/simulador — lista de simulaciones disponibles (Brecha 2).
 * Solo se devuelve lista si el curso del usuario tiene simuladorPolitica o está en modo demo.
 */
import { NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getSimulations } from "@/lib/services/simulations";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as courseFeaturesService from "@/lib/services/course-features";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    if (getDemoMode()) {
      const list = await getSimulations();
      return NextResponse.json(list);
    }
    const auth = await getAuthFromRequest(req as import("next/server").NextRequest);
    if (useFirebase()) {
      const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
      if (!enrollment) {
        return NextResponse.json({ error: "Sin grupo activo" }, { status: 403 });
      }
      const courseId = await firebaseContent.getPrimaryCourseForCohort(enrollment.cohort_id);
      if (!courseId) {
        return NextResponse.json({ error: "Curso no disponible" }, { status: 403 });
      }
      const features = await courseFeaturesService.getCourseFeatures(courseId);
      if (features.simuladorPolitica !== true) {
        return NextResponse.json({ error: "El Simulador de Política Pública no está habilitado para tu curso" }, { status: 403 });
      }
    }
    const list = await getSimulations();
    return NextResponse.json(list);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "No autorizado";
    if (msg === "No autorizado" || msg.includes("auth")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
