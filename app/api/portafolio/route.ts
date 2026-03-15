/**
 * GET: lista mis proyectos. POST: crea un proyecto (Brecha 5).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode } from "@/lib/env";
import * as portfolio from "@/lib/services/portfolio";
import type { PortfolioProjectInput } from "@/lib/types/portfolio";

export const dynamic = "force-dynamic";

function parseBody(body: unknown): Partial<PortfolioProjectInput> | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  return {
    titulo: typeof b.titulo === "string" ? b.titulo : "",
    institucion: typeof b.institucion === "string" ? b.institucion : "",
    problema: typeof b.problema === "string" ? b.problema : "",
    solucion: typeof b.solucion === "string" ? b.solucion : "",
    resultado: typeof b.resultado === "string" ? b.resultado : "",
    ciudadanosBeneficiados: typeof b.ciudadanosBeneficiados === "number" ? b.ciudadanosBeneficiados : Number(b.ciudadanosBeneficiados) || 0,
    modulos: Array.isArray(b.modulos) ? b.modulos.map(String) : [],
    evidencias: Array.isArray(b.evidencias) ? b.evidencias.map(String) : [],
    estadoProyecto: ["idea", "en_progreso", "implementado", "escalado"].includes(String(b.estadoProyecto)) ? (b.estadoProyecto as PortfolioProjectInput["estadoProyecto"]) : "en_progreso",
    fechaInicio: typeof b.fechaInicio === "string" ? b.fechaInicio : new Date().toISOString().slice(0, 10),
    publico: Boolean(b.publico),
  };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    const uid = auth.uid;
    let list = await portfolio.listProjectsByUser(uid);
    if (getDemoMode() && list.length === 0) {
      list = [
        {
          id: "demo-portfolio",
          titulo: "Proyecto demo de transformación",
          institucion: "Secretaría demo",
          problema: "Falta de transparencia en trámites",
          solucion: "Ventanilla única digital",
          resultado: "Reducción del 40% en tiempo de respuesta",
          ciudadanosBeneficiados: 500,
          modulos: ["Módulo 1", "Módulo 2"],
          evidencias: [],
          estadoProyecto: "implementado",
          fechaInicio: "2025-01-15",
          evaluacionClaude: "Demo: evaluación de impacto positiva.",
          scoreImpacto: 78,
          publico: true,
          createdAt: new Date().toISOString(),
        },
      ] as typeof list;
    }
    return NextResponse.json({ projects: list });
  } catch (e) {
    if (String(e).includes("No autorizado") || (e as { status?: number })?.status === 401) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.json({ error: "Error al listar portafolio" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const input = parseBody(body);
    if (!input || !input.titulo?.trim() || !input.problema?.trim() || !input.solucion?.trim()) {
      return NextResponse.json(
        { error: "Faltan titulo, problema o solucion" },
        { status: 400 }
      );
    }
    const full: PortfolioProjectInput = {
      titulo: input.titulo,
      institucion: input.institucion ?? "",
      problema: input.problema,
      solucion: input.solucion,
      resultado: input.resultado ?? "",
      ciudadanosBeneficiados: input.ciudadanosBeneficiados ?? 0,
      modulos: input.modulos ?? [],
      evidencias: input.evidencias ?? [],
      estadoProyecto: input.estadoProyecto ?? "en_progreso",
      fechaInicio: input.fechaInicio ?? new Date().toISOString().slice(0, 10),
      publico: input.publico ?? false,
    };
    if (getDemoMode()) {
      return NextResponse.json({
        project: {
          id: "demo-new",
          ...full,
          evaluacionClaude: "",
          scoreImpacto: 0,
          createdAt: new Date().toISOString(),
        },
      });
    }
    const project = await portfolio.createProject(auth.uid, full);
    return NextResponse.json({ project });
  } catch (e) {
    if (String(e).includes("No autorizado")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.json({ error: "Error al crear proyecto" }, { status: 500 });
  }
}
