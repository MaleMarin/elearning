/**
 * GET: quiénes aprendieron un concepto (Brecha 6).
 * Query: institutionId, conceptId.
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
    const conceptId = req.nextUrl.searchParams.get("conceptId")?.trim();
    if (!conceptId) return NextResponse.json({ error: "conceptId requerido" }, { status: 400 });
    const learners = await knowledge.getLearnersForConcept(institutionId, conceptId);
    return NextResponse.json({ learners });
  } catch (e) {
    return NextResponse.json({ error: "Error al cargar aprendices" }, { status: 500 });
  }
}
