/**
 * GET /api/certificado/verificar?idCert=PD-2025-0842-MX
 * Público: devuelve datos del certificado si existe.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode } from "@/lib/env";
import * as certificado from "@/lib/services/certificado";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const idCert = req.nextUrl.searchParams.get("idCert")?.trim();
  if (!idCert) return NextResponse.json({ valid: false }, { status: 400 });

  if (getDemoMode()) {
    if (idCert === "PD-2026-1234-MX") {
      return NextResponse.json({
        valid: true,
        nombre: "Estudiante demo",
        curso: "Política Digital",
        fecha: new Date().toLocaleDateString("es-MX"),
        calificacion: "85%",
        idCert,
      });
    }
    return NextResponse.json({ valid: false });
  }

  const record = await certificado.getCertificateByIdCert(idCert);
  if (!record) return NextResponse.json({ valid: false });
  return NextResponse.json({
    valid: true,
    nombre: record.nombre,
    curso: record.curso,
    fecha: record.fecha,
    calificacion: record.calificacion,
    idCert: record.idCert,
  });
}
