/**
 * GET: certificados del usuario actual (Firestore users/{uid}/certificates).
 * En demo devuelve un certificado de ejemplo.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, getAppUrl } from "@/lib/env";
import * as certificado from "@/lib/services/certificado";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let auth: { uid: string };
  try {
    auth = await getAuthFromRequest(req);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (getDemoMode()) {
    const demoCert = {
      id: "demo-cert",
      idCert: "PD-2026-1234-MX",
      user_id: auth.uid,
      cohort_id: null,
      course_id: "demo-course",
      issued_at: new Date().toISOString(),
      nombre: "Estudiante demo",
      curso: "Política Digital",
      fecha: new Date().toLocaleDateString("es-MX"),
      calificacion: "85%",
      storageUrl: null,
      verifyUrl: `${getAppUrl()}/verificar/PD-2026-1234-MX`,
    };
    return NextResponse.json({ certificates: [demoCert] });
  }

  const list = await certificado.getCertificatesForUser(auth.uid);
  const certificates = list.map((c) => ({
    id: `${c.idCert}-${c.createdAt}`,
    idCert: c.idCert,
    user_id: auth.uid,
    cohort_id: null,
    course_id: null,
    issued_at: c.createdAt,
    nombre: c.nombre,
    curso: c.curso,
    fecha: c.fecha,
    calificacion: c.calificacion,
    storageUrl: c.storageUrl,
    verifyUrl: c.verifyUrl,
  }));
  return NextResponse.json({ certificates });
}
