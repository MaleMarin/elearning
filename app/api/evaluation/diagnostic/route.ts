import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as evaluation from "@/lib/services/evaluation";
import type { DiagnosticAnswers } from "@/lib/services/evaluation";
import * as points from "@/lib/services/points";

export const dynamic = "force-dynamic";

/** GET: estado del diagnóstico (completado, saltado, o null) */
export async function GET(req: NextRequest) {
  try {
    if (getDemoMode()) {
      return NextResponse.json({
        completed: true,
        skipped: false,
        data: null,
      });
    }
    if (!useFirebase()) {
      return NextResponse.json({ completed: true, skipped: false, data: null });
    }
    const auth = await getAuthFromRequest(req);
    const data = await evaluation.getDiagnostic(auth.uid);
    const completed = !!data && !!data.completedAt && !data.skipped;
    return NextResponse.json({
      completed,
      skipped: data?.skipped ?? false,
      data: data ?? null,
    });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

/** POST: guardar diagnóstico (completar o "completar después" = skip) */
export async function POST(req: NextRequest) {
  try {
    if (getDemoMode()) {
      return NextResponse.json({ ok: true });
    }
    if (!useFirebase()) {
      return NextResponse.json({ ok: true });
    }
    const auth = await getAuthFromRequest(req);
    const body = await req.json();
    const { answers, skipped } = body as { answers: DiagnosticAnswers; skipped?: boolean };
    const completedAt = skipped ? null : new Date().toISOString();
    await evaluation.setDiagnostic(auth.uid, {
      answers: answers ?? {},
      completedAt,
      skipped: !!skipped,
    });
    if (!skipped) {
      points.addPoints(auth.uid, "diagnostic_completed").catch(() => {});
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 401 }
    );
  }
}
