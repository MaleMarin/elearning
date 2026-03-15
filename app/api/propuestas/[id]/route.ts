import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as lessonProposals from "@/lib/services/lessonProposals";

export const dynamic = "force-dynamic";

/** GET: una propuesta (solo el autor). */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (getDemoMode()) return NextResponse.json({ error: "No disponible" }, { status: 404 });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 404 });
  try {
    const auth = await getAuthFromRequest(req);
    const { id } = await params;
    const prop = await lessonProposals.getProposal(id);
    if (!prop) return NextResponse.json({ error: "Propuesta no encontrada" }, { status: 404 });
    if ((prop.autorId as string) !== auth.uid) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    const toIso = (v: unknown) => (v && typeof (v as { toDate?: () => Date }).toDate === "function" ? (v as { toDate: () => Date }).toDate().toISOString() : v);
    return NextResponse.json({
      id: prop.id,
      ...prop,
      createdAt: toIso(prop.createdAt),
      updatedAt: toIso(prop.updatedAt),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}

/** PATCH: actualizar propuesta (autor: borrador) o enviar. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 404 });
  try {
    const auth = await getAuthFromRequest(req);
    const { id } = await params;
    const prop = await lessonProposals.getProposal(id);
    if (!prop) return NextResponse.json({ error: "Propuesta no encontrada" }, { status: 404 });
    if ((prop.autorId as string) !== auth.uid) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    if ((prop.estado as string) !== "borrador") {
      return NextResponse.json({ error: "Solo se puede editar una propuesta en borrador" }, { status: 400 });
    }
    const body = await req.json().catch(() => ({}));
    const updates: Parameters<typeof lessonProposals.updateProposal>[1] = {};
    if (typeof body.titulo === "string") updates.titulo = body.titulo.trim();
    if (typeof body.descripcion === "string") updates.descripcion = body.descripcion;
    if (typeof body.experienciaReal === "string") updates.experienciaReal = body.experienciaReal.trim();
    if (typeof body.moduleIdSugerido === "string") updates.moduleIdSugerido = body.moduleIdSugerido.trim();
    if (body.contenidoGenerado !== undefined) updates.contenidoGenerado = body.contenidoGenerado;
    if (body.enviar === true) updates.estado = "enviada";
    await lessonProposals.updateProposal(id, updates);
    const updated = await lessonProposals.getProposal(id);
    return NextResponse.json({ propuesta: updated });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
