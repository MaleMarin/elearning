/**
 * GET: un proyecto. PATCH: actualizar proyecto (Brecha 5).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as portfolio from "@/lib/services/portfolio";
import type { PortfolioProjectInput } from "@/lib/types/portfolio";

export const dynamic = "force-dynamic";

function parseBody(body: unknown): Partial<PortfolioProjectInput> & { evaluacionClaude?: string; scoreImpacto?: number } | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const out: Partial<PortfolioProjectInput> & { evaluacionClaude?: string; scoreImpacto?: number } = {};
  if (typeof b.titulo === "string") out.titulo = b.titulo;
  if (typeof b.institucion === "string") out.institucion = b.institucion;
  if (typeof b.problema === "string") out.problema = b.problema;
  if (typeof b.solucion === "string") out.solucion = b.solucion;
  if (typeof b.resultado === "string") out.resultado = b.resultado;
  if (typeof b.ciudadanosBeneficiados === "number") out.ciudadanosBeneficiados = b.ciudadanosBeneficiados;
  if (typeof b.ciudadanosBeneficiados === "string") out.ciudadanosBeneficiados = parseInt(b.ciudadanosBeneficiados, 10) || 0;
  if (Array.isArray(b.modulos)) out.modulos = b.modulos.map(String);
  if (Array.isArray(b.evidencias)) out.evidencias = b.evidencias.map(String);
  if (["idea", "en_progreso", "implementado", "escalado"].includes(String(b.estadoProyecto))) out.estadoProyecto = b.estadoProyecto as PortfolioProjectInput["estadoProyecto"];
  if (typeof b.fechaInicio === "string") out.fechaInicio = b.fechaInicio;
  if (typeof b.publico === "boolean") out.publico = b.publico;
  if (typeof b.evaluacionClaude === "string") out.evaluacionClaude = b.evaluacionClaude;
  if (typeof b.scoreImpacto === "number") out.scoreImpacto = b.scoreImpacto;
  return out;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const auth = await getAuthFromRequest(_req);
    const { projectId } = await params;
    if (!projectId) return NextResponse.json({ error: "projectId requerido" }, { status: 400 });
    const project = await portfolio.getProject(auth.uid, projectId);
    if (!project) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    return NextResponse.json({ project });
  } catch (e) {
    if (String(e).includes("No autorizado")) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    return NextResponse.json({ error: "Error al obtener proyecto" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const auth = await getAuthFromRequest(req);
    const { projectId } = await params;
    if (!projectId) return NextResponse.json({ error: "projectId requerido" }, { status: 400 });
    const body = await req.json().catch(() => ({}));
    const updates = parseBody(body);
    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
    }
    const project = await portfolio.updateProject(auth.uid, projectId, updates);
    if (!project) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    return NextResponse.json({ project });
  } catch (e) {
    if (String(e).includes("No autorizado")) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    return NextResponse.json({ error: "Error al actualizar proyecto" }, { status: 500 });
  }
}
