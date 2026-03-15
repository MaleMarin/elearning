/**
 * POST: enviar evaluación de un par (scores por criterio + feedback).
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as workshop from "@/lib/services/workshop";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workshopId: string }> }
) {
  const { workshopId } = await params;
  if (getDemoMode()) return NextResponse.json({ ok: true });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const reviewedId = typeof body.reviewedUserId === "string" ? body.reviewedUserId : "";
    const scores = (typeof body.scores === "object" && body.scores !== null) ? body.scores as Record<string, number> : {};
    const feedback = typeof body.feedback === "string" ? body.feedback : "";
    if (!reviewedId) return NextResponse.json({ error: "Falta reviewedUserId" }, { status: 400 });
    const assignment = await workshop.getAssignment(workshopId, auth.uid);
    if (!assignment || !assignment.reviewerOf.includes(reviewedId)) {
      return NextResponse.json({ error: "No tienes asignado evaluar a este usuario" }, { status: 403 });
    }
    await workshop.setReview(workshopId, auth.uid, reviewedId, { scores, feedback });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
  }
}
