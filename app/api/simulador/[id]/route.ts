/**
 * GET /api/simulador/[id] — una simulación por id (Brecha 2).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getSimulation } from "@/lib/services/simulations";
import { getDemoMode } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!getDemoMode()) {
      await getAuthFromRequest(req);
    }
    const { id } = await params;
    const sim = await getSimulation(id);
    if (!sim) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    return NextResponse.json(sim);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
