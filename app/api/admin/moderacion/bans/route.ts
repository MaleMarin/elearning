/**
 * GET /api/admin/moderacion/bans — Lista baneos activos. Solo admin.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as modStore from "@/lib/services/moderacion-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ bans: [] });
  if (!useFirebase()) return NextResponse.json({ bans: [] });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const bans = await modStore.listActiveBans();
    return NextResponse.json({ bans });
  } catch {
    return NextResponse.json({ bans: [] });
  }
}
