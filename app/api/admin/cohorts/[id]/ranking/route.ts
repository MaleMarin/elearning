import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";

export const dynamic = "force-dynamic";

/** GET: ranking interno de la cohorte (ordenado por % avance desc). */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (getDemoMode()) {
    return NextResponse.json({
      ranking: [
        { userId: "u2", displayName: "Otro alumno", progressPct: 80, rank: 1 },
        { userId: "u1", displayName: "Alumno demo", progressPct: 45, rank: 2 },
      ],
    });
  }
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 404 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin" && auth.role !== "mentor") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    const { id: cohortId } = await params;
    const ranking = await firebaseContent.getCohortRanking(cohortId);
    return NextResponse.json({ ranking });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
