import { NextRequest, NextResponse } from "next/server";
import { getDemoMode } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as evaluation from "@/lib/services/evaluation";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    if (getDemoMode()) {
      return NextResponse.json({
        diagnostic: {
          byExperience: { "Sin experiencia previa": 3, "Alguna experiencia (he leído sobre el tema)": 5, "Experiencia práctica (lo he aplicado en mi trabajo)": 2 },
          byMotivation: { "Quiero crecer profesionalmente": 4, "Me interesa el tema por iniciativa propia": 6 },
          total: 10,
        },
        quiz: { averageScore: 72, totalAttempts: 8, passedCount: 6, passPercent: 75 },
        nps: { average: 8.2, promoterCount: 5, passiveCount: 2, detractorCount: 1, total: 8 },
        blockAverages: { methodology: 4.2, content: 4.5, platform: 4.0 },
        comments: [
          { userId: "demo1", comment: "Muy buen programa, aplicaría más casos prácticos.", completedAt: new Date().toISOString() },
          { userId: "demo2", comment: "Útil para mi equipo.", completedAt: new Date().toISOString() },
        ],
      });
    }
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") {
      return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    }
    const stats = await evaluation.getAdminEvaluationStats();
    return NextResponse.json(stats);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al cargar estadísticas";
    const status = msg === "No autorizado" ? 401 : 403;
    return NextResponse.json({ error: msg }, { status });
  }
}
