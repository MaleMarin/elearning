/**
 * GET /api/admin/cursos/metricas
 * Métricas agregadas por curso (alumnos, completación, activos, en riesgo). Solo admin.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let user: { role: string } | null = null;
  try {
    user = await getAuthFromRequest(req);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const db = getFirebaseAdminFirestore();
    const cursosSnap = await db.collection("courses").orderBy("created_at", "desc").get();

    const cursos = await Promise.all(
      cursosSnap.docs.map(async (doc) => {
        const curso = doc.data();
        const courseId = doc.id;

        // Cohorts que tienen este curso asignado
        const linksSnap = await db
          .collection("cohort_courses")
          .where("course_id", "==", courseId)
          .get();

        let totalAlumnos = 0;
        for (const link of linksSnap.docs) {
          const cohortId = link.data().cohort_id as string;
          const countSnap = await db
            .collection("enrollments")
            .where("cohort_id", "==", cohortId)
            .where("status", "==", "active")
            .count()
            .get();
          totalAlumnos += countSnap.data().count;
        }

        const title = (curso.title as string) || (curso.titulo as string) || "Sin título";
        return {
          id: courseId,
          titulo: title,
          alumnos: totalAlumnos,
          completacion: (curso.avgCompletion as number) ?? 0,
          activos: (curso.activeToday as number) ?? 0,
          enRiesgo: (curso.atRiskCount as number) ?? 0,
        };
      })
    );

    return NextResponse.json({ cursos });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
