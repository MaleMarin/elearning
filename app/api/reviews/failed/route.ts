/**
 * POST: marcar repaso como fallido; reagendar en 3 días.
 * Body: { reviewId }
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode } from "@/lib/env";
import * as spacedRepetition from "@/lib/services/spacedRepetition";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ ok: true });
  try {
    const auth = await getAuthFromRequest(req);
    const body = await req.json();
    const reviewId = body.reviewId as string;
    if (!reviewId?.trim()) return NextResponse.json({ error: "Falta reviewId" }, { status: 400 });
    await spacedRepetition.markReviewFailed(auth.uid, reviewId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
