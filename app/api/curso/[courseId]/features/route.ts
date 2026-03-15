/**
 * GET /api/curso/[courseId]/features
 * Devuelve los feature flags del curso solo si el usuario está inscrito en un grupo
 * cuyo curso primario es este courseId.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as courseFeatures from "@/lib/services/course-features";
import { DEFAULT_COURSE_FEATURES } from "@/lib/types/course-features";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  if (!courseId) {
    return NextResponse.json({ error: "courseId requerido" }, { status: 400 });
  }

  if (getDemoMode()) {
    return NextResponse.json({ features: { ...DEFAULT_COURSE_FEATURES } });
  }

  if (!useFirebase()) {
    return NextResponse.json({ features: { ...DEFAULT_COURSE_FEATURES } });
  }

  try {
    const auth = await getAuthFromRequest(_req);
    const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
    if (!enrollment) {
      return NextResponse.json({ error: "Sin grupo activo" }, { status: 403 });
    }
    const primaryCourseId = await firebaseContent.getPrimaryCourseForCohort(enrollment.cohort_id);
    if (primaryCourseId !== courseId) {
      return NextResponse.json({ error: "No tienes acceso a este curso" }, { status: 403 });
    }
    const features = await courseFeatures.getCourseFeatures(courseId);
    return NextResponse.json({ features });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "No autorizado") {
      return NextResponse.json({ error: msg }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
