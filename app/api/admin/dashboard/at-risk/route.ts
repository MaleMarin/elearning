/**
 * GET /api/admin/dashboard/at-risk
 * Alumnos sin actividad > 5 días y progreso < 30%. Solo admin.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as firebaseProgress from "@/lib/services/firebase-progress";

export const dynamic = "force-dynamic";

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
const MAX_AT_RISK = 30;

export async function GET(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json({
      alumnos: [
        { id: "1", nombre: "María García", institucion: "SHCP", progreso: 18, ultimoAcceso: "hace 6 días" },
        { id: "2", nombre: "Juan Pérez", institucion: "SFP", progreso: 25, ultimoAcceso: "hace 5 días" },
      ],
    });
  }
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    if (!useFirebase()) return NextResponse.json({ alumnos: [] });
    const db = getFirebaseAdminFirestore();
    const enrollmentsSnap = await db.collection("enrollments").where("status", "==", "active").limit(200).get();
    const now = Date.now();
    const atRisk: { id: string; nombre: string; institucion: string; progreso: number; ultimoAcceso: string }[] = [];
    for (const doc of enrollmentsSnap.docs) {
      if (atRisk.length >= MAX_AT_RISK) break;
      const data = doc.data();
      const userId = data.user_id as string;
      const cohortId = data.cohort_id as string;
      const courseId = await firebaseContent.getPrimaryCourseForCohort(cohortId);
      if (!courseId) continue;
      const [profileSnap, progress] = await Promise.all([
        db.collection("profiles").doc(userId).get(),
        firebaseProgress.getProgress(userId, courseId),
      ]);
      const lastActivity = (profileSnap.data()?.lastActivityDate as string) ?? null;
      const lastMs = lastActivity ? new Date(lastActivity).getTime() : 0;
      if (now - lastMs < FIVE_DAYS_MS) continue;
      const modules = await firebaseContent.getPublishedModules(courseId);
      const lessonIds = (await firebaseContent.getPublishedLessons(modules.map((m) => m.id))).map((l) => l.id);
      const total = lessonIds.length;
      const done = progress.completedLessonIds.filter((id) => lessonIds.includes(id)).length;
      const progresoPct = total > 0 ? Math.round((done / total) * 100) : 0;
      if (progresoPct >= 30) continue;
      const fullName = (profileSnap.data()?.full_name as string) ?? "Sin nombre";
      const institution = (profileSnap.data()?.institution as string) ?? "";
      const dias = Math.floor((now - lastMs) / (24 * 60 * 60 * 1000));
      atRisk.push({
        id: userId,
        nombre: fullName,
        institucion: institution || "—",
        progreso: progresoPct,
        ultimoAcceso: dias === 0 ? "hoy" : dias === 1 ? "hace 1 día" : `hace ${dias} días`,
      });
    }
    return NextResponse.json({ alumnos: atRisk });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
