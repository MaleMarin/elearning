import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as modStore from "@/lib/services/moderacion-store";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (getDemoMode()) return NextResponse.json({ ok: true });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 404 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const { id: queueId } = await params;
    if (!queueId) return NextResponse.json({ error: "Falta id" }, { status: 400 });
    const body = await req.json().catch(() => ({}));
    const feedback = (body.feedback as string)?.trim() ?? "";
    await modStore.resolveQueueItem(queueId, "rechazado", auth.uid);
    return NextResponse.json({ ok: true, feedback });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
