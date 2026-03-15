/**
 * POST: reenviar email de notificación del certificado al alumno.
 * Body: { userId, courseId }
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode } from "@/lib/env";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import * as certificado from "@/lib/services/certificado";
import { sendCertificateReadyEmail } from "@/lib/services/certificate-email";
import { getAppUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ ok: true });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    const userId = (body.userId as string)?.trim();
    const courseId = (body.courseId as string)?.trim();
    if (!userId || !courseId) return NextResponse.json({ error: "Faltan userId o courseId" }, { status: 400 });

    const record = await certificado.getCertificate(userId, courseId);
    if (!record) return NextResponse.json({ error: "Certificado no encontrado" }, { status: 404 });

    const snap = await getFirebaseAdminFirestore().collection("profiles").doc(userId).get();
    const toEmail = (snap.data()?.email as string) ?? null;
    if (!toEmail) return NextResponse.json({ error: "El usuario no tiene email" }, { status: 400 });

    await sendCertificateReadyEmail({
      toEmail,
      nombre: record.nombre,
      curso: record.curso,
      certificadoUrl: `${getAppUrl()}/certificado`,
      idCert: record.idCert,
      verifyUrl: record.verifyUrl,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
