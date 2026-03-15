import { NextRequest, NextResponse } from "next/server";
import { getDemoMode } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as evaluation from "@/lib/services/evaluation";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    if (getDemoMode()) {
      const rows: evaluation.AdminEvaluationExportRow[] = [
        {
          userId: "demo-user-1",
          diagnosticExperience: "Alguna experiencia (he leído sobre el tema)",
          diagnosticMotivation: "Quiero crecer profesionalmente",
          diagnosticChallenges: "Procesos muy rígidos o burocráticos",
          diagnosticExpectation: "Aprender metodologías aplicables",
          diagnosticAvailability: "2 a 4 horas",
          diagnosticSkipped: "No",
          diagnosticCompletedAt: new Date().toISOString(),
          quizScore: "8",
          quizTotal: "10",
          quizPassed: "Sí",
          quizCompletedAt: new Date().toISOString(),
          surveyMethodologyAvg: "4.33",
          surveyContentAvg: "4.67",
          surveyPlatformAvg: "4.00",
          surveyNps: "9",
          surveyComment: "Muy buen programa.",
          surveyCompletedAt: new Date().toISOString(),
        },
      ];
      return NextResponse.json(rows);
    }
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") {
      return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    }
    const rows = await evaluation.getAdminEvaluationExportRows();
    return NextResponse.json(rows);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al exportar";
    const status = msg === "No autorizado" ? 401 : 403;
    return NextResponse.json({ error: msg }, { status });
  }
}
