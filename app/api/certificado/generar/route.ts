/**
 * POST /api/certificado/generar
 * Body: { userId, courseId, forzar?: boolean }
 * forzar: true = emisión manual por admin (no exige 100%).
 * Genera certificado, guarda en Storage + Firestore, envía email y retorna { url, idCert }.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, getAppUrl } from "@/lib/env";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as grades from "@/lib/services/grades";
import * as certificado from "@/lib/services/certificado";
import { buildCertificatePdf } from "@/lib/services/certificate-pdf";
import { sendCertificateReadyEmail } from "@/lib/services/certificate-email";
import { logAudit } from "@/lib/services/audit-logs";
import * as portfolio from "@/lib/services/portfolio";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function getDisplayName(uid: string): Promise<string> {
  const snap = await getFirebaseAdminFirestore().collection("profiles").doc(uid).get();
  const name = (snap.data()?.full_name as string)?.trim();
  return name || "Estudiante";
}

async function getEmail(uid: string): Promise<string | null> {
  const snap = await getFirebaseAdminFirestore().collection("profiles").doc(uid).get();
  return (snap.data()?.email as string) ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const userId = typeof body.userId === "string" ? body.userId.trim() : "";
    const courseId = typeof body.courseId === "string" ? body.courseId.trim() : "";
    const forzar = body.forzar === true;

    if (!userId || !courseId) {
      return NextResponse.json({ error: "Faltan userId o courseId" }, { status: 400 });
    }

    if (forzar) {
      if (auth.role !== "admin") {
        return NextResponse.json({ error: "Solo un administrador puede emitir certificados manualmente" }, { status: 403 });
      }
    } else {
      if (auth.uid !== userId) {
        return NextResponse.json({ error: "No puedes generar el certificado de otro usuario" }, { status: 403 });
      }
      const completed = await certificado.hasCompleted100(userId, courseId);
      if (!completed) {
        return NextResponse.json({ error: "Debes completar el 100% del curso para obtener el certificado" }, { status: 400 });
      }
    }

    const course = await firebaseContent.getCourse(courseId).catch(() => null);
    const courseTitle = (course?.title as string) ?? "Política Digital";
    const nombre = await getDisplayName(userId);
    const summary = await grades.getStudentGradeSummary(userId, courseId);
    const calificacion = summary.finalGrade != null ? `${summary.finalGrade}%` : "N/A";
    const appUrl = getAppUrl();

    const portfolioProject = !getDemoMode() ? await portfolio.getPrimaryProjectForCertificate(userId).catch(() => null) : null;
    let pdfBuffer: Buffer | null = null;
    if (!getDemoMode()) {
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
    }

    const { url, idCert, record } = await certificado.createCertificate({
      userId,
      courseId,
      forzar,
      adminId: forzar ? auth.uid : null,
      nombre,
      curso: courseTitle,
      calificacion,
      pdfBuffer,
      appUrl,
    });

    logAudit(userId, "certificate_download", { certId: idCert }).catch(() => {});

    if (!getDemoMode()) {
      const toEmail = await getEmail(userId);
      if (toEmail) {
        sendCertificateReadyEmail({
          toEmail,
          nombre,
          curso: courseTitle,
          certificadoUrl: `${appUrl}/certificado`,
          idCert,
          verifyUrl: record.verifyUrl,
        }).catch(() => {});
      }
    }

    return NextResponse.json({ url, idCert });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al generar certificado";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
