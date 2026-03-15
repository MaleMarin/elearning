/**
 * POST: destacar (solo admin). Body: { highlighted: boolean }
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as insights from "@/lib/services/insights";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ moduleId: string; itemId: string }> }
) {
  const { moduleId, itemId } = await params;
  if (!moduleId || !itemId) return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  if (getDemoMode()) return NextResponse.json({ ok: true });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo admin" }, { status: 403 });
    const body = await req.json();
    const highlighted = body.highlighted === true;
    await insights.setHighlighted(moduleId, itemId, highlighted);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
