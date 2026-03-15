import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as grades from "@/lib/services/grades";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId") ?? "";
  if (!courseId) return NextResponse.json({ error: "courseId requerido" }, { status: 400 });
  if (getDemoMode()) {
    return NextResponse.json({
      items: [
        { type: "lesson", id: "l1", title: "Introducción", moduleId: "m1", status: "completed", score: 100, maxScore: 100 },
        { type: "quiz", id: "q1", title: "Quiz 1", moduleId: "m1", status: "completed", score: 80, maxScore: 100 },
      ],
      finalGrade: 90,
      progressPercent: 50,
    });
  }
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
    const cohortId = enrollment?.cohort_id ?? null;
    if (!cohortId) return NextResponse.json({ error: "Sin grupo" }, { status: 404 });
    const primaryCourseId = await firebaseContent.getPrimaryCourseForCohort(cohortId);
    if (primaryCourseId !== courseId) return NextResponse.json({ error: "Curso no coincide" }, { status: 403 });
    const summary = await grades.getStudentGradeSummary(auth.uid, courseId);
    return NextResponse.json(summary);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
  }
}
