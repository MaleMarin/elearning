import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as evaluation from "@/lib/services/evaluation";

export const dynamic = "force-dynamic";

export interface EvaluationStatusResponse {
  diagnosticCompleted: boolean;
  diagnosticSkipped: boolean;
  quizCompleted: boolean;
  closingSurveyCompleted: boolean;
}

export async function GET(req: NextRequest): Promise<NextResponse<EvaluationStatusResponse | { error: string }>> {
  try {
    if (getDemoMode()) {
      return NextResponse.json({
        diagnosticCompleted: true,
        diagnosticSkipped: false,
        quizCompleted: false,
        closingSurveyCompleted: false,
      });
    }
    if (!useFirebase()) {
      return NextResponse.json({
        diagnosticCompleted: true,
        diagnosticSkipped: false,
        quizCompleted: false,
        closingSurveyCompleted: false,
      });
    }
    const auth = await getAuthFromRequest(req);
    const [diagnosticCompleted, diagnostic, quizCompleted, surveyDoc] = await Promise.all([
      evaluation.getDiagnosticCompleted(auth.uid),
      evaluation.getDiagnostic(auth.uid),
      evaluation.getQuizCompleted(auth.uid),
      evaluation.getClosingSurvey(auth.uid).then((s) => !!s),
    ]);
    return NextResponse.json({
      diagnosticCompleted: diagnosticCompleted || (!!diagnostic?.completedAt && !diagnostic?.skipped),
      diagnosticSkipped: diagnostic?.skipped ?? false,
      quizCompleted,
      closingSurveyCompleted: surveyDoc,
    });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
