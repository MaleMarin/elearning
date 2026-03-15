import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as lessonProposals from "@/lib/services/lessonProposals";

export const dynamic = "force-dynamic";

/** GET: listar propuestas para admin (todas o filtro por estado). */
export async function GET(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ propuestas: [] });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 404 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin" && auth.role !== "mentor") {
      return NextResponse.json({ error: "Solo administradores o mentores" }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const estado = searchParams.get("estado") as "enviada" | "en_revision" | "aprobada" | "rechazada" | null;
    const list = await lessonProposals.listProposalsForAdmin(estado ? { estado } : undefined);
    const propuestas = list.map((p) => ({
      id: p.id,
      titulo: p.titulo,
      descripcion: p.descripcion,
      autorNombre: p.autorNombre,
      autorInstitucion: p.autorInstitucion,
      moduleIdSugerido: p.moduleIdSugerido,
      estado: p.estado,
      feedbackAdmin: p.feedbackAdmin,
      contenidoGenerado: p.contenidoGenerado,
      createdAt: (p.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString?.() ?? p.createdAt,
    }));
    return NextResponse.json({ propuestas });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
