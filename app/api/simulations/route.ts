/**
 * GET: micro-simulación por moduleId o lessonId (alumno).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode } from "@/lib/env";
import * as simulations from "@/lib/services/simulations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!getDemoMode()) {
    try {
      await getAuthFromRequest(req);
    } catch {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }
  const { searchParams } = new URL(req.url);
  const moduleId = searchParams.get("moduleId") ?? undefined;
  const lessonId = searchParams.get("lessonId") ?? undefined;
  if (!moduleId && !lessonId) {
    return NextResponse.json({ error: "Indica moduleId o lessonId" }, { status: 400 });
  }
  const list = moduleId
    ? await simulations.listSimulations({ moduleId })
    : await simulations.listSimulations({ lessonId });
  const simulation = list[0] ?? null;
  return NextResponse.json({ simulation });
}
