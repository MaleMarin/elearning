import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";
import { listCompetencias, getEvidenciaByUser } from "@/lib/services/competencias";
import type { NivelCompetencia } from "@/lib/types/competencias";

export const dynamic = "force-dynamic";

const NIVEL_ORDER: NivelCompetencia[] = ["basico", "intermedio", "avanzado"];
function nivelToValue(n: NivelCompetencia): number {
  const i = NIVEL_ORDER.indexOf(n);
  return i >= 0 ? i + 1 : 0;
}

export interface CompetenciaPerfil {
  id: string;
  nombre: string;
  nivelEntrada: NivelCompetencia;
  nivelSalida: NivelCompetencia;
  valueEntrada: number;
  valueSalida: number;
}

/** GET: competencias del usuario — nivel al entrar (diagnóstico) y al salir (evidencia del curso). */
export async function GET(req: NextRequest) {
  if (getDemoMode()) {
    const demoCompetencias: CompetenciaPerfil[] = [
      { id: "1", nombre: "Orientación a resultados", nivelEntrada: "basico", nivelSalida: "intermedio", valueEntrada: 1, valueSalida: 2 },
      { id: "2", nombre: "Trabajo en equipo", nivelEntrada: "basico", nivelSalida: "basico", valueEntrada: 1, valueSalida: 1 },
      { id: "3", nombre: "Liderazgo", nivelEntrada: "basico", nivelSalida: "avanzado", valueEntrada: 1, valueSalida: 3 },
      { id: "4", nombre: "Visión estratégica", nivelEntrada: "basico", nivelSalida: "intermedio", valueEntrada: 1, valueSalida: 2 },
      { id: "5", nombre: "Innovación", nivelEntrada: "intermedio", nivelSalida: "avanzado", valueEntrada: 2, valueSalida: 3 },
      { id: "6", nombre: "Gestión del cambio", nivelEntrada: "basico", nivelSalida: "basico", valueEntrada: 1, valueSalida: 1 },
      { id: "7", nombre: "Orientación al ciudadano", nivelEntrada: "basico", nivelSalida: "intermedio", valueEntrada: 1, valueSalida: 2 },
      { id: "8", nombre: "Toma de decisiones", nivelEntrada: "basico", nivelSalida: "intermedio", valueEntrada: 1, valueSalida: 2 },
    ];
    return NextResponse.json({ competencias: demoCompetencias, courseName: "Política Digital (demo)" });
  }

  if (!useFirebase()) {
    return NextResponse.json({ competencias: [], courseName: null });
  }

  try {
    const auth = await getAuthFromRequest(req);
    const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
    const cohortId = enrollment?.cohort_id ?? null;
    const courseId = cohortId
      ? await firebaseContent.getPrimaryCourseForCohort(cohortId)
      : null;

    const catalog = await listCompetencias();
    if (!catalog.length) {
      return NextResponse.json({ competencias: [], courseName: null });
    }

    let evidencia: { competenciaId: string; nombre: string; nivel: NivelCompetencia; modulos: string[] }[] = [];
    let courseName: string | null = null;
    if (courseId) {
      const course = await firebaseContent.getCourse(courseId).catch(() => null);
      courseName = (course?.title as string) ?? null;
      evidencia = await getEvidenciaByUser(auth.uid, courseId);
    }

    const evidenciaByComp = new Map(evidencia.map((e) => [e.competenciaId, e.nivel]));

    const competencias: CompetenciaPerfil[] = catalog.map((c) => {
      const nivelSalida = evidenciaByComp.get(c.id) ?? "basico";
      const nivelEntrada = "basico";
      return {
        id: c.id,
        nombre: c.nombre,
        nivelEntrada,
        nivelSalida,
        valueEntrada: nivelToValue(nivelEntrada),
        valueSalida: nivelToValue(nivelSalida),
      };
    });

    return NextResponse.json({
      competencias,
      courseName,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg.includes("FIREBASE_SERVICE_ACCOUNT_JSON") || msg.includes("no está definido")) {
      return NextResponse.json({ competencias: [], courseName: null });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
