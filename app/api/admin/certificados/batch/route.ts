/**
 * POST /api/admin/certificados/batch
 * Body: { cohortId }. Emite certificados a todos los alumnos con 100% que aún no tienen. Máximo 50.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as grades from "@/lib/services/grades";
import * as certificado from "@/lib/services/certificado";
import { buildCertificatePdf } from "@/lib/services/certificate-pdf";
import { sendCertificateReadyEmail } from "@/lib/services/certificate-email";
import * as portfolio from "@/lib/services/portfolio";
import { getAppUrl } from "@/lib/env";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MAX_BATCH = 50;

async function getDisplayName(uid: string): Promise<string> {
  const snap = await getFirebaseAdminFirestore().collection("profiles").doc(uid).get();
  return (snap.data()?.full_name as string)?.trim() || "Estudiante";
}

async function getEmail(uid: string): Promise<string | null> {
  const snap = await getFirebaseAdminFirestore().collection("profiles").doc(uid).get();
  return (snap.data()?.email as string) ?? null;
}

export async function POST(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json({ ok: true, emitted: 0, message: "Demo" });
  }
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    const cohortId = (body.cohortId as string)?.trim();
    if (!cohortId) return NextResponse.json({ error: "cohortId requerido" }, { status: 400 });

    const courseId = await firebaseContent.getPrimaryCourseForCohort(cohortId);
    if (!courseId) return NextResponse.json({ emitted: 0 });

    const course = await firebaseContent.getCourse(courseId).catch(() => null);
    const courseTitle = (course?.title as string) ?? "Política Digital";
    const appUrl = getAppUrl();

    const enrollments = await getFirebaseAdminFirestore()
      .collection("enrollments")
      .where("cohort_id", "==", cohortId)
      .where("status", "==", "active")
      .get();

    let emitted = 0;
    let processed = 0;

    for (const doc of enrollments.docs) {
      if (processed >= MAX_BATCH) break;
      const uid = doc.data().user_id as string;
      const summary = await grades.getStudentGradeSummary(uid, courseId);
      if (summary.progressPercent < 100) continue;
      const existing = await certificado.getCertificate(uid, courseId);
      if (existing) continue;

      processed++;
      const nombre = await getDisplayName(uid);
      const calificacion = summary.finalGrade != null ? `${summary.finalGrade}%` : "N/A";
      const portfolioProject = await portfolio.getPrimaryProjectForCertificate(uid).catch(() => null);
      const pdfBuffer = await buildCertificatePdf({
        nombre,
        curso: courseTitle,
        fecha: new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" }),
        calificacion,
        idCert: certificado.generarIdCert(uid, courseId),
        ...(portfolioProject && (portfolioProject.titulo || portfolioProject.institucion)
          ? {
              portfolioProject: {
                titulo: portfolioProject.titulo,
                ciudadanosBeneficiados: portfolioProject.ciudadanosBeneficiados,
                institucion: portfolioProject.institucion,
              },
            }
          : {}),
      });

      const { record } = await certificado.createCertificate({
        userId: uid,
        courseId,
        forzar: false,
        nombre,
        curso: courseTitle,
        calificacion,
        pdfBuffer,
        appUrl,
      });

      const toEmail = await getEmail(uid);
      if (toEmail) {
        sendCertificateReadyEmail({
          toEmail,
          nombre,
          curso: courseTitle,
          certificadoUrl: `${appUrl}/certificado`,
          idCert: record.idCert,
          verifyUrl: record.verifyUrl,
        }).catch(() => {});
      }
      emitted++;
    }

    return NextResponse.json({ ok: true, emitted });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
