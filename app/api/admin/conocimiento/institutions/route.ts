/**
 * GET: lista de instituciones con datos en el grafo (Brecha 6).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as knowledge from "@/lib/services/knowledge-graph";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const ids = await knowledge.listInstitutionsWithKnowledge();
    return NextResponse.json({ institutions: ids });
  } catch (e) {
    return NextResponse.json({ error: "Error al listar" }, { status: 500 });
  }
}
