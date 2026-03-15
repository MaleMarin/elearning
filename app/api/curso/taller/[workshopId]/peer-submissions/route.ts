/**
 * GET: entregas que el usuario debe evaluar (sus reviewerOf).
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as workshop from "@/lib/services/workshop";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ workshopId: string }> }
) {
  const { workshopId } = await params;
  if (getDemoMode()) {
    return NextResponse.json({
      peers: [
        { reviewedUserId: "demo-1", content: "Contenido de ejemplo para evaluar.", fileUrl: null, slot: 1 },
      ],
    });
  }
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(_req);
    const assignment = await workshop.getAssignment(workshopId, auth.uid);
    if (!assignment || assignment.reviewerOf.length === 0) {
      return NextResponse.json({ peers: [] });
    }
    const peers: { reviewedUserId: string; content: string; fileUrl: string | null; slot: number; reviewCompleted: boolean }[] = [];
    let slot = 1;
    for (const reviewedId of assignment.reviewerOf) {
      const sub = await workshop.getSubmission(workshopId, reviewedId);
      const existingReview = await workshop.getReview(workshopId, auth.uid, reviewedId);
      peers.push({
        reviewedUserId: reviewedId,
        content: sub?.content ?? "",
        fileUrl: sub?.fileUrl ?? null,
        slot: slot++,
        reviewCompleted: !!existingReview,
      });
    }
    return NextResponse.json({ peers });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
  }
}
