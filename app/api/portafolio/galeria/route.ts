/**
 * GET /api/portafolio/galeria — proyectos públicos para la galería (Brecha 5).
 * Query: institucion, modulo, estadoProyecto (idea | en_progreso | implementado | escalado).
 */
import { NextRequest, NextResponse } from "next/server";
import * as portfolio from "@/lib/services/portfolio";
import type { EstadoProyecto } from "@/lib/types/portfolio";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const institucion = searchParams.get("institucion") ?? undefined;
    const modulo = searchParams.get("modulo") ?? undefined;
    const estadoProyecto = searchParams.get("estadoProyecto") as EstadoProyecto | null;
    const filters: portfolio.GaleriaFilters = {};
    if (institucion?.trim()) filters.institucion = institucion.trim();
    if (modulo?.trim()) filters.modulo = modulo.trim();
    if (estadoProyecto && ["idea", "en_progreso", "implementado", "escalado"].includes(estadoProyecto)) {
      filters.estadoProyecto = estadoProyecto;
    }
    const projects = await portfolio.getPublicProjects(filters);
    return NextResponse.json({ projects });
  } catch (e) {
    console.error("Portafolio galeria:", e);
    return NextResponse.json({ error: "Error al cargar galería" }, { status: 500 });
  }
}
