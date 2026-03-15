import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as grades from "@/lib/services/grades";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json([
      { userId: "u1", email: "alumno@demo.com", finalGrade: 85, progressPercent: 100 },
      { userId: "u2", email: "alumno2@demo.com", finalGrade: 72, progressPercent: 80 },
    ]);
  }
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    await getAuthFromRequest(req);
    const { searchParams } = new URL(req.url);
    const cohortId = searchParams.get("cohortId");
    if (!cohortId) return NextResponse.json({ error: "cohortId requerido" }, { status: 400 });
    const courseId = await firebaseContent.getPrimaryCourseForCohort(cohortId);
    if (!courseId) return NextResponse.json([]);
    const enrollments = await getFirebaseAdminFirestore()
      .collection("enrollments")
      .where("cohort_id", "==", cohortId)
      .where("status", "==", "active")
      .get();
    const results: { userId: string; email: string | null; finalGrade: number | null; progressPercent: number }[] = [];
    for (const doc of enrollments.docs) {
      const uid = doc.data().user_id as string;
      const summary = await grades.getStudentGradeSummary(uid, courseId);
      let email: string | null = null;
      try {
        const profile = await getFirebaseAdminFirestore().collection("profiles").doc(uid).get();
        email = (profile.data()?.email as string) ?? null;
      } catch {
        // ignore
      }
      results.push({
        userId: uid,
        email,
        finalGrade: summary.finalGrade,
        progressPercent: summary.progressPercent,
      });
    }
    return NextResponse.json(results);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
  }
}
