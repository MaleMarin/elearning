import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as grades from "@/lib/services/grades";

export const dynamic = "force-dynamic";

function escapeCsv(s: string): string {
  if (/[,"\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: NextRequest) {
  const user = await getAuthFromRequest(req);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const grupoId = req.nextUrl.searchParams.get("grupoId") || req.nextUrl.searchParams.get("cohortId") || "";
  if (!grupoId) return NextResponse.json({ error: "grupoId o cohortId requerido" }, { status: 400 });

  const db = getFirebaseAdminFirestore();
  const enrollSnap = await db
    .collection("enrollments")
    .where("cohort_id", "==", grupoId)
    .where("status", "==", "active")
    .get();

  const courseId = await firebaseContent.getPrimaryCourseForCohort(grupoId);
  const rows = ["Nombre,Email,Progreso (%),Nota Final,Último Acceso"];

  for (const doc of enrollSnap.docs) {
    const e = doc.data();
    const uid = e.user_id as string;
    const summary = courseId ? await grades.getStudentGradeSummary(uid, courseId) : { finalGrade: null, progressPercent: 0 };
    const profileSnap = await db.collection("profiles").doc(uid).get();
    const u = profileSnap.data() || {};
    const fullName = (u.full_name ?? u.fullName ?? "") as string;
    const email = (u.email ?? "") as string;
    const lastAccess = (e.last_access ?? e.lastAccess ?? "") as string;
    rows.push(
      [
        escapeCsv(fullName),
        escapeCsv(email),
        summary.progressPercent ?? 0,
        summary.finalGrade ?? "N/A",
        escapeCsv(typeof lastAccess === "string" ? lastAccess : ""),
      ].join(",")
    );
  }

  return new NextResponse("\uFEFF" + rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="calificaciones-${grupoId}.csv"`,
    },
  });
}
