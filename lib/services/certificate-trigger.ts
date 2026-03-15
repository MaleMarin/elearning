/**
 * Trigger de certificado al completar 100% del curso.
 * Se invoca desde progress/complete (no desde el cliente) para evitar que el alumno genere su propio cert manualmente.
 */

import { getDemoMode, getAppUrl } from "@/lib/env";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as grades from "@/lib/services/grades";
import * as certificado from "@/lib/services/certificado";
import { buildCertificatePdf } from "@/lib/services/certificate-pdf";
import { sendCertificateReadyEmail } from "@/lib/services/certificate-email";
import * as points from "@/lib/services/points";
import * as portfolio from "@/lib/services/portfolio";

async function getDisplayName(uid: string): Promise<string> {
  const snap = await getFirebaseAdminFirestore().collection("profiles").doc(uid).get();
  return (snap.data()?.full_name as string)?.trim() || "Estudiante";
}

async function getEmail(uid: string): Promise<string | null> {
  const snap = await getFirebaseAdminFirestore().collection("profiles").doc(uid).get();
  return (snap.data()?.email as string) ?? null;
}

export async function triggerCertificateIfEligible(userId: string, courseId: string): Promise<void> {
  if (getDemoMode()) return;
  const existing = await certificado.getCertificate(userId, courseId);
  if (existing) return;
  const completed = await certificado.hasCompleted100(userId, courseId);
  if (!completed) return;

  const course = await firebaseContent.getCourse(courseId).catch(() => null);
  const courseTitle = (course?.title as string) ?? "Política Digital";
  const nombre = await getDisplayName(userId);
  const summary = await grades.getStudentGradeSummary(userId, courseId);
  const calificacion = summary.finalGrade != null ? `${summary.finalGrade}%` : "N/A";
  const appUrl = getAppUrl();

  const portfolioProject = await portfolio.getPrimaryProjectForCertificate(userId).catch(() => null);
  let pdfBuffer: Buffer | null = null;
  pdfBuffer = await buildCertificatePdf({
    nombre,
    curso: courseTitle,
    fecha: new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" }),
    calificacion,
    idCert: certificado.generarIdCert(userId, courseId),
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
    userId,
    courseId,
    forzar: false,
    nombre,
    curso: courseTitle,
    calificacion,
    pdfBuffer,
    appUrl,
  });

  points.addPoints(userId, "certificate_earned", { courseId }).catch(() => {});
  const toEmail = await getEmail(userId);
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
}
