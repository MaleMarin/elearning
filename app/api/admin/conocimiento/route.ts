/**
 * GET: grafo de conocimiento de una institución (Brecha 6).
 * Query: institutionId (requerido).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as knowledge from "@/lib/services/knowledge-graph";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const institutionId = req.nextUrl.searchParams.get("institutionId")?.trim() || "default";
    const nodes = await knowledge.getKnowledgeGraph(institutionId);
    const totalEmpleados = nodes.length > 0 ? Math.max(...nodes.map((n) => n.usuariosQueLoDominan), 1) : 0;
    return NextResponse.json({ nodes, institutionId, totalEmpleados });
  } catch (e) {
    return NextResponse.json({ error: "Error al cargar grafo" }, { status: 500 });
  }
}
