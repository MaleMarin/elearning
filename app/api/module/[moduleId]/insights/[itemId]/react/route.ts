/**
 * POST: reaccionar (body: reaction: "like" | "love", delta: 1 | -1).
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
    await getAuthFromRequest(req);
    const body = await req.json();
    const reaction = body.reaction === "love" ? "love" : "like";
    const delta = body.delta === -1 ? -1 : 1;
    await insights.react(moduleId, itemId, reaction, delta);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
