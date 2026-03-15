import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as quizService from "@/lib/services/quiz";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (getDemoMode()) {
    return NextResponse.json({ totalAttempts: 12, passedCount: 8, passPercent: 66.67, questionErrors: {} });
  }
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    await getAuthFromRequest(_req);
    const { id } = await params;
    const stats = await quizService.getQuizStats(id);
    return NextResponse.json(stats);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
  }
}
