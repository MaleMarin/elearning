import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as evaluation from "@/lib/services/evaluation";
import type { ClosingSurveyData } from "@/lib/services/evaluation";

export const dynamic = "force-dynamic";

/** POST: enviar encuesta de cierre (solo una vez) */
export async function POST(req: NextRequest) {
  try {
    if (getDemoMode()) {
      return NextResponse.json({ ok: true });
    }
    if (!useFirebase()) {
      return NextResponse.json({ ok: true });
    }
    const auth = await getAuthFromRequest(req);
    const existing = await evaluation.getClosingSurvey(auth.uid);
    if (existing) {
      return NextResponse.json({ ok: true });
    }
    const body = await req.json();
    const { methodology, content, platform, nps, comment } = body as {
      methodology: number[];
      content: number[];
      platform: number[];
      nps: number;
      comment?: string;
    };
    const data: ClosingSurveyData = {
      methodology: Array.isArray(methodology) ? methodology.slice(0, 3) : [0, 0, 0],
      content: Array.isArray(content) ? content.slice(0, 3) : [0, 0, 0],
      platform: Array.isArray(platform) ? platform.slice(0, 3) : [0, 0, 0],
      nps: Math.min(10, Math.max(0, Number(nps) || 0)),
      comment: typeof comment === "string" ? comment.slice(0, 2000) : undefined,
      completedAt: new Date().toISOString(),
    };
    await evaluation.setClosingSurvey(auth.uid, data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 401 }
    );
  }
}
