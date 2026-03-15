import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as grades from "@/lib/services/grades";
import * as certificado from "@/lib/services/certificado";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json({
      courseId: "demo-course",
      rows: [
        { userId: "u1", nombre: "Alumno demo", email: "alumno@demo.com", progressPercent: 100, hasCertificate: true, issuedAt: new Date().toISOString(), idCert: "PD-2026-1234-MX" },
        { userId: "u2", nombre: "Segundo", email: "alumno2@demo.com", progressPercent: 80, hasCertificate: false, issuedAt: null, idCert: null },
      ],
    });
  }
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const cohortId = req.nextUrl.searchParams.get("cohortId")?.trim();
    if (!cohortId) return NextResponse.json({ error: "cohortId requerido" }, { status: 400 });
    const progressFilter = req.nextUrl.searchParams.get("progressFilter");
    const certFilter = req.nextUrl.searchParams.get("certFilter");

    const courseId = await firebaseContent.getPrimaryCourseForCohort(cohortId);
    if (!courseId) return NextResponse.json({ courseId: null, rows: [] });

    const enrollments = await getFirebaseAdminFirestore()
      .collection("enrollments")
      .where("cohort_id", "==", cohortId)
      .where("status", "==", "active")
      .get();

    const rows: { userId: string; nombre: string; email: string | null; progressPercent: number; hasCertificate: boolean; issuedAt: string | null; idCert: string | null }[] = [];

    for (const doc of enrollments.docs) {
      const uid = doc.data().user_id as string;
      const summary = await grades.getStudentGradeSummary(uid, courseId);
      const cert = await certificado.getCertificate(uid, courseId);
      const profile = await getFirebaseAdminFirestore().collection("profiles").doc(uid).get();
      const nombre = (profile.data()?.full_name as string)?.trim() || "Estudiante";
      const email = (profile.data()?.email as string) ?? null;
      const progressPercent = Math.round(summary.progressPercent);
      const hasCertificate = !!cert;
      if (progressFilter) {
        const min = progressFilter === "100" ? 100 : progressFilter === "90" ? 90 : 80;
        if (progressPercent < min) continue;
      }
      if (certFilter === "con" && !hasCertificate) continue;
      if (certFilter === "sin" && hasCertificate) continue;
      rows.push({
        userId: uid,
        nombre,
        email,
        progressPercent,
        hasCertificate,
        issuedAt: cert?.createdAt ?? null,
        idCert: cert?.idCert ?? null,
      });
    }
    return NextResponse.json({ courseId, rows });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
