/**
 * GET /api/v1/alumnos/[userId]/progreso
 * Requiere API key con permiso "progreso" o "admin".
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { requireApiKey } from "@/lib/auth/api-key-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as firebaseProgress from "@/lib/services/firebase-progress";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const auth = await requireApiKey(req, "progreso");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { userId } = await params;
  if (!userId?.trim()) {
    return NextResponse.json({ error: "userId requerido" }, { status: 400 });
  }

  if (getDemoMode()) {
    return NextResponse.json({
      progreso: 45,
      leccionesCompletadas: 9,
      ultimaActividad: new Date().toISOString(),
    });
  }

  if (!useFirebase()) {
    return NextResponse.json({ error: "No disponible" }, { status: 404 });
  }

  try {
    const enrollment = await firebaseContent.getActiveEnrollmentForUser(userId);
    if (!enrollment) {
      return NextResponse.json({
        progreso: 0,
        leccionesCompletadas: 0,
        ultimaActividad: null,
      });
    }
    const courseId = await firebaseContent.getPrimaryCourseForCohort(enrollment.cohort_id);
    if (!courseId) {
      return NextResponse.json({
        progreso: 0,
        leccionesCompletadas: 0,
        ultimaActividad: null,
      });
    }
    const modules = await firebaseContent.getPublishedModules(courseId);
    const lessons = await firebaseContent.getPublishedLessons(modules.map((m) => m.id));
    const total = lessons.length;
    const progress = await firebaseProgress.getProgress(userId, courseId);
    const completed = progress.completedLessonIds.length;
    const progreso = total > 0 ? Math.round((completed / total) * 100) : 0;
    const progressDoc = await getFirebaseAdminFirestore().collection("progress").doc(`${userId}_${courseId}`).get();
    let ultimaActividad: string | null = null;
    if (progressDoc.exists) {
      const data = progressDoc.data();
      const u = (data as { updatedAt?: unknown })?.updatedAt;
      if (u && typeof (u as { toDate?: () => Date }).toDate === "function") {
        ultimaActividad = (u as { toDate: () => Date }).toDate().toISOString();
      }
    }
    return NextResponse.json({
      progreso,
      leccionesCompletadas: completed,
      ultimaActividad,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
