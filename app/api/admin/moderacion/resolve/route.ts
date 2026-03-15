/**
 * POST /api/admin/moderacion/resolve — Resolver ítem de la cola (aprobado/rechazado). Solo admin.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as modStore from "@/lib/services/moderacion-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ ok: true });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 404 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    const queueId = (body.queueId as string)?.trim();
    const resolution = body.resolution === "rechazado" ? "rechazado" : "aprobado";
    if (!queueId) return NextResponse.json({ error: "Falta queueId" }, { status: 400 });
    await modStore.resolveQueueItem(queueId, resolution, auth.uid);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
