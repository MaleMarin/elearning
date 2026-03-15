/**
 * GET /api/admin/dashboard/activity
 * Últimas acciones: lecciones completadas, badges, certificados. Solo admin.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json({
      items: [
        { id: "1", tipo: "leccion", texto: "Ana López completó la lección «Innovación en servicios»", timestamp: "hace 5 min" },
        { id: "2", tipo: "badge", texto: "Carlos Ruiz obtuvo el badge «Primera lección»", timestamp: "hace 12 min" },
        { id: "3", tipo: "certificado", texto: "Certificado emitido a Laura Martínez", timestamp: "hace 1 h" },
      ],
    });
  }
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    // Feed desde audit: cada usuario tiene users/{uid}/audit_logs; para un feed global se puede agregar un índice o colección consolidada.
    return NextResponse.json({ items: [] });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
