/**
 * GET /api/admin/moderacion/queue — Cola de contenido en revisión (solo admin).
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as modStore from "@/lib/services/moderacion-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ queue: [] });
  if (!useFirebase()) return NextResponse.json({ queue: [] });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const queue = await modStore.listModerationQueue();
    return NextResponse.json({ queue });
  } catch {
    return NextResponse.json({ queue: [] });
  }
}
