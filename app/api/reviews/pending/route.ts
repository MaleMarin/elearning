/**
 * GET: repasos pendientes del usuario (máx. 3 para una sesión).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode } from "@/lib/env";
import * as spacedRepetition from "@/lib/services/spacedRepetition";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ reviews: [] });
  try {
    const auth = await getAuthFromRequest(req);
    const reviews = await spacedRepetition.getPendingReviewsForSession(auth.uid);
    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
