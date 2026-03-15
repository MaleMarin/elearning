/**
 * GET /api/admin/moderacion/history — Historial de decisiones (solo admin).
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as modStore from "@/lib/services/moderacion-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ history: [] });
  if (!useFirebase()) return NextResponse.json({ history: [] });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const limit = Math.min(100, Math.max(1, Number(req.nextUrl.searchParams.get("limit")) || 50));
    const history = await modStore.listModerationHistory(limit);
    return NextResponse.json({ history });
  } catch {
    return NextResponse.json({ history: [] });
  }
}
