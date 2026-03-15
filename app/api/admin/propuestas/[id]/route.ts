import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as lessonProposals from "@/lib/services/lessonProposals";
import * as profileService from "@/lib/services/profile";

export const dynamic = "force-dynamic";

/** GET: una propuesta (admin). */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 404 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin" && auth.role !== "mentor") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    const { id } = await params;
    const prop = await lessonProposals.getProposal(id);
    if (!prop) return NextResponse.json({ error: "Propuesta no encontrada" }, { status: 404 });
    const toIso = (v: unknown) => (v && typeof (v as { toDate?: () => Date }).toDate === "function" ? (v as { toDate: () => Date }).toDate().toISOString() : v);
    return NextResponse.json({
      ...prop,
      createdAt: toIso(prop.createdAt),
      updatedAt: toIso(prop.updatedAt),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

/** PATCH: aprobar, rechazar con feedback, o editar y aprobar. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (getDemoMode()) return NextResponse.json({ error: "No disponible" }, { status: 404 });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 404 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin" && auth.role !== "mentor") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const action = body.action as string;
    const prop = await lessonProposals.getProposal(id);
    if (!prop) return NextResponse.json({ error: "Propuesta no encontrada" }, { status: 404 });

    if (action === "rechazar") {
      const feedbackAdmin = typeof body.feedbackAdmin === "string" ? body.feedbackAdmin.trim() : "";
      await lessonProposals.updateProposal(id, { estado: "rechazada", feedbackAdmin });
      return NextResponse.json({ ok: true, estado: "rechazada" });
    }

    if (action === "aprobar" || action === "editar_y_aprobar") {
      if (action === "editar_y_aprobar" && body.contenidoGenerado) {
        await lessonProposals.updateProposal(id, { contenidoGenerado: body.contenidoGenerado });
      }
      const updated = await lessonProposals.getProposal(id);
      const contenido = updated?.contenidoGenerado;
      if (!contenido || !(contenido as { objetivo?: string }).objetivo) {
        return NextResponse.json({ error: "La propuesta no tiene contenido generado válido para crear la lección" }, { status: 400 });
      }
      const lesson = await lessonProposals.createLessonFromProposal(updated as Record<string, unknown>);
      await lessonProposals.updateProposal(id, { estado: "aprobada" });
      const autorId = prop.autorId as string;
      await profileService.setBadge(autorId, "experto_contribuidor");
      return NextResponse.json({
        ok: true,
        estado: "aprobada",
        lessonId: lesson.id,
      });
    }

    return NextResponse.json({ error: "Acción no válida. Usa action: aprobar | rechazar | editar_y_aprobar" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
