/**
 * GET: datos del hub del Laboratorio (frase semanal, contadores, zonas con contenido nuevo).
 * El Simulador de Política Pública (Brecha 2) se incluye solo si el curso del usuario tiene simuladorPolitica o en modo demo.
 */
import { NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as lab from "@/lib/services/lab";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as courseFeaturesService from "@/lib/services/course-features";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  let showSimulador = getDemoMode();
  if (!getDemoMode()) {
    try {
      const auth = await getAuthFromRequest(req as import("next/server").NextRequest);
      if (useFirebase()) {
        const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
        if (enrollment) {
          const courseId = await firebaseContent.getPrimaryCourseForCohort(enrollment.cohort_id);
          if (courseId) {
            const features = await courseFeaturesService.getCourseFeatures(courseId);
            showSimulador = features.simuladorPolitica === true;
          }
        }
      }
    } catch {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  const [phrase, counts, newZones] = await Promise.all([
    lab.getWeeklyPhrase(),
    lab.getActiveCountsByZone(),
    lab.getZonesWithNewContent(),
  ]);
  const zones = lab.LAB_ZONES.map((z) => ({
    ...z,
    activeToday: counts[z.id] ?? 0,
    hasNewContent: newZones.has(z.id),
  }));

  const payload: {
    weeklyPhrase: string;
    zones: typeof zones;
    hablasHumano: { href: string; name: string; description: string; icon: string; activeToday: number; hasNewContent: boolean };
    simulador?: { href: string; name: string; description: string; icon: string; activeToday: number; hasNewContent: boolean; featured: boolean };
  } = {
    weeklyPhrase: phrase,
    zones,
    hablasHumano: {
      href: "/laboratorio/hablas-humano",
      name: "¿Hablas humano?",
      description: "5 modos para traducir el lenguaje tech.",
      icon: "💬",
      activeToday: counts["hablas_humano"] ?? 0,
      hasNewContent: newZones.has("hablas_humano"),
    },
  };
  if (showSimulador) {
    payload.simulador = {
      href: "/simulador",
      name: "Simulador de Política Pública",
      description: "Toma decisiones reales. Claude evalúa como experto.",
      icon: "📋",
      activeToday: 0,
      hasNewContent: true,
      featured: true,
    };
  }
  return NextResponse.json(payload);
}
