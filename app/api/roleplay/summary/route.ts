/**
 * POST /api/roleplay/summary
 * Guarda el resumen de una sesión de roleplay (usuario autenticado).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode } from "@/lib/env";
import { saveRoleplaySummary } from "@/lib/services/roleplay";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (getDemoMode()) {
      return NextResponse.json({ ok: true });
    }
    const auth = await getAuthFromRequest(req);
    const body = await req.json();
    const scenarioId = body.scenarioId as string | undefined;
    const scenarioTitle = body.scenarioTitle as string | undefined;
    const turnCount = typeof body.turnCount === "number" ? body.turnCount : 0;
    const feedback = (body.feedback as string) ?? undefined;
    if (!scenarioId?.trim() || !scenarioTitle?.trim()) {
      return NextResponse.json(
        { error: "Faltan scenarioId o scenarioTitle" },
        { status: 400 }
      );
    }
    await saveRoleplaySummary(
      auth.uid,
      scenarioId,
      scenarioTitle,
      turnCount,
      feedback
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
