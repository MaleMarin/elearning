import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";

export const dynamic = "force-dynamic";

function toIso(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "string") return v;
  const d = v as { toDate?: () => Date };
  return d?.toDate?.()?.toISOString?.() ?? null;
}

/** GET: datos de "Tu grupo" para la vista del alumno (nombre, fechas, compañeros, mi ranking, próx. fecha límite). */
export async function GET(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json({
      cohortId: "demo-cohort-id",
      nombre: "Grupo 2025-I demo",
      fechaInicio: new Date().toISOString(),
      fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      totalAlumnos: 12,
      myRank: 3,
      nextModuleDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      nextModuleTitle: "Módulo 2",
    });
  }
  if (!useFirebase()) return NextResponse.json({ cohortId: null });
  try {
    const auth = await getAuthFromRequest(req);
    const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
    if (!enrollment) return NextResponse.json({ cohortId: null });
    const cohortId = enrollment.cohort_id;
    const cohort = await firebaseContent.getCohort(cohortId);
    const nombre = (cohort.nombre as string) ?? (cohort.name as string) ?? "Grupo";
    const fechaInicio = toIso(cohort.fechaInicio);
    const fechaFin = toIso(cohort.fechaFin);
    const alumnos = (cohort.alumnos as string[]) ?? [];
    const totalAlumnos = alumnos.length || (await firebaseContent.listActiveEnrollmentUserIdsInCohort(cohortId)).length;
    const ranking = await firebaseContent.getCohortRanking(cohortId);
    const myEntry = ranking.find((r) => r.userId === auth.uid);
    const myRank = myEntry?.rank ?? null;

    let nextModuleDeadline: string | null = null;
    let nextModuleTitle: string | null = null;
    const limites = (cohort.limiteFechasPorModulo as Record<string, { toDate?: () => Date }>) ?? {};
    const now = Date.now();
    let nearest: { date: Date; title: string } | null = null;
    const courseId = (cohort.courseId as string) ?? (await firebaseContent.getPrimaryCourseForCohort(cohortId));
    if (courseId) {
      const modules = await firebaseContent.getPublishedModules(courseId);
      for (const mod of modules) {
        const ts = limites[mod.id];
        if (!ts) continue;
        const date = typeof ts.toDate === "function" ? ts.toDate() : new Date(ts as unknown as string);
        if (date.getTime() > now && (!nearest || date.getTime() < nearest.date.getTime())) {
          nearest = { date, title: mod.title };
        }
      }
      if (nearest) {
        nextModuleDeadline = nearest.date.toISOString();
        nextModuleTitle = nearest.title;
      }
    }

    return NextResponse.json({
      cohortId,
      nombre,
      fechaInicio,
      fechaFin,
      totalAlumnos,
      myRank,
      nextModuleDeadline,
      nextModuleTitle,
    });
  } catch {
    return NextResponse.json({ cohortId: null });
  }
}
