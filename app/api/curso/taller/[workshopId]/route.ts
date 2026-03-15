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
      workshop: { id: workshopId, title: "Taller demo", description: "Entrega y evalúa a tus pares.", rubric: [{ id: "c1", label: "Criterio 1", maxScore: 10 }], deadline: null, reviewDeadline: null, peerCount: 2 },
      submission: null,
      assignment: null,
      averageScore: null,
    });
  }
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(_req);
    const [w, sub, assign] = await Promise.all([
      workshop.getWorkshop(workshopId),
      workshop.getSubmission(workshopId, auth.uid),
      workshop.getAssignment(workshopId, auth.uid),
    ]);
    if (!w) return NextResponse.json({ error: "Taller no encontrado" }, { status: 404 });
    const averageScore = await workshop.getAverageScoreForUser(workshopId, auth.uid);
    return NextResponse.json({ workshop: w, submission: sub, assignment: assign, averageScore });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
  }
}
