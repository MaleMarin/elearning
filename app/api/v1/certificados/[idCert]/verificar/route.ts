/**
 * GET /api/v1/certificados/[idCert]/verificar
 * API pública: verificar un certificado por ID. No requiere API key.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as certificado from "@/lib/services/certificado";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ idCert: string }> }
) {
  const { idCert } = await params;
  if (!idCert?.trim()) {
    return NextResponse.json({ valido: false, error: "idCert requerido" }, { status: 400 });
  }

  if (getDemoMode()) {
    return NextResponse.json({
      valido: true,
      nombre: "Usuario Demo",
      curso: "Política Digital (demo)",
      fecha: new Date().toISOString(),
      calificacion: "Aprobado",
    });
  }

  if (!useFirebase()) {
    return NextResponse.json({ valido: false }, { status: 200 });
  }

  try {
    const record = await certificado.getCertificateByIdCert(idCert.trim());
    if (!record) {
      return NextResponse.json({ valido: false });
    }
    return NextResponse.json({
      valido: true,
      nombre: record.nombre,
      curso: record.curso,
      fecha: record.fecha,
      calificacion: record.calificacion,
    });
  } catch {
    return NextResponse.json({ valido: false }, { status: 200 });
  }
}
