/**
 * GET /api/admin/moderacion — Lista reportes (cola + historial) y bans. Solo admin.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as modStore from "@/lib/services/moderacion-store";

export const dynamic = "force-dynamic";

function toReporteItem(
  item: { id: string; source: string; authorId: string; texto: string; razon: string; createdAt: Date; resolution?: string | null; decision?: string }
) {
  const estado = item.resolution === "aprobado" || item.decision === "revisado_aprobado" ? "aprobado" : item.resolution === "rechazado" || item.decision === "revisado_rechazado" ? "rechazado" : "pendiente";
  const tipoMap: Record<string, "post" | "comentario" | "glosario" | "show_tell"> = {
    comunidad_post: "post",
    comunidad_comment: "comentario",
    glosario_term: "glosario",
    showntell_submission: "show_tell",
  };
  return {
    id: item.id,
    tipo: tipoMap[item.source] ?? "post",
    contenido: (item.texto ?? "").slice(0, 200),
    autorId: item.authorId,
    autorNombre: "",
    razon: item.razon,
    fecha: item.createdAt instanceof Date ? item.createdAt.toISOString() : String(item.createdAt),
    estado,
  };
}

export async function GET(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ reportes: [], bans: [] });
  if (!useFirebase()) return NextResponse.json({ reportes: [], bans: [] });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const [queue, history, bans] = await Promise.all([
      modStore.listModerationQueue(),
      modStore.listModerationHistory(),
      modStore.listActiveBans(),
    ]);
    const reportes = [
      ...queue.map((q) => toReporteItem({ ...q, resolution: null })),
      ...history.map((h) => toReporteItem({ id: h.id, source: h.source, authorId: h.authorId, texto: h.texto, razon: h.razon, createdAt: h.decidedAt, decision: h.decision })),
    ];
    const bansPayload = bans.map((b) => ({
      id: b.id,
      userId: b.userId,
      razon: b.reason,
      dias: Math.ceil((b.bannedUntil.getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
      hasta: b.bannedUntil.toISOString().slice(0, 10),
      activo: b.bannedUntil > new Date(),
    }));
    return NextResponse.json({ reportes, bans: bansPayload });
  } catch {
    return NextResponse.json({ reportes: [], bans: [] });
  }
}
