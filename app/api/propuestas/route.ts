import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as lessonProposals from "@/lib/services/lessonProposals";
import * as profileService from "@/lib/services/profile";

export const dynamic = "force-dynamic";

/** GET: listar mis propuestas. */
export async function GET(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ propuestas: [] });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 404 });
  try {
    const auth = await getAuthFromRequest(req);
    const list = await lessonProposals.listProposalsByAuthor(auth.uid);
    const propuestas = list.map((p) => ({
      id: p.id,
      titulo: p.titulo,
      descripcion: p.descripcion,
      moduleIdSugerido: p.moduleIdSugerido,
      estado: p.estado,
      feedbackAdmin: p.feedbackAdmin,
      createdAt: (p.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString?.() ?? p.createdAt,
    }));
    return NextResponse.json({ propuestas });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}

/** POST: crear o enviar propuesta. */
export async function POST(req: NextRequest) {
  if (getDemoMode()) {
    const body = await req.json().catch(() => ({}));
    return NextResponse.json({
      id: "demo-propuesta-id",
      titulo: body.titulo ?? "Propuesta demo",
      estado: "enviada",
    });
  }
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 404 });
  try {
    const auth = await getAuthFromRequest(req);
    const profile = await profileService.getProfile(auth.uid);
    const body = await req.json().catch(() => ({}));
    const titulo = typeof body.titulo === "string" ? body.titulo.trim() : "";
    const descripcion = typeof body.descripcion === "string" ? body.descripcion.trim() : "";
    const experienciaReal = typeof body.experienciaReal === "string" ? body.experienciaReal.trim() : "";
    const moduleIdSugerido = typeof body.moduleIdSugerido === "string" ? body.moduleIdSugerido.trim() : "";
    if (!titulo || !experienciaReal || !moduleIdSugerido) {
      return NextResponse.json({ error: "Faltan titulo, experienciaReal o moduleIdSugerido" }, { status: 400 });
    }
    const enviar = body.enviar === true;
    const prop = await lessonProposals.createProposal({
      autorId: auth.uid,
      autorNombre: profile?.fullName ?? auth.email ?? "Alumno",
      autorInstitucion: profile?.institution ?? "",
      titulo,
      descripcion,
      experienciaReal,
      moduleIdSugerido,
      estado: enviar ? "enviada" : "borrador",
      contenidoGenerado: body.contenidoGenerado ?? null,
    });
    return NextResponse.json({
      id: prop.id,
      titulo: prop.titulo,
      estado: prop.estado,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
