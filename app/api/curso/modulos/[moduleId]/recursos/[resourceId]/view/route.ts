/**
 * POST: marca el recurso como visto/leído por el alumno.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as resources from "@/lib/services/resources";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ moduleId: string; resourceId: string }> }
) {
  const { resourceId } = await params;
  if (!resourceId) return NextResponse.json({ error: "Falta resourceId" }, { status: 400 });
  if (getDemoMode()) return NextResponse.json({ ok: true });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    await resources.markResourceViewed(auth.uid, resourceId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
