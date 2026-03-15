/**
 * POST: marcar el módulo del par como completado (ambos reciben badge).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as learningPairs from "@/lib/services/learningPairs";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ pairId: string }> }
) {
  const { pairId } = await params;
  if (!pairId) return NextResponse.json({ error: "Falta pairId" }, { status: 400 });
  if (getDemoMode()) return NextResponse.json({ ok: true });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    const pair = await learningPairs.completePair(pairId, auth.uid);
    if (!pair) return NextResponse.json({ error: "No encontrado o ya completado" }, { status: 404 });
    return NextResponse.json({ ok: true, pair });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
