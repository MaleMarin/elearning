/**
 * GET: lista de afirmaciones para Mitos y verdades (orden aleatorio).
 */
import { NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode } from "@/lib/env";
import * as labMyths from "@/lib/services/lab-myths";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!getDemoMode()) {
    try {
      await getAuthFromRequest(req as import("next/server").NextRequest);
    } catch {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }
  const myths = await labMyths.getMyths();
  return NextResponse.json({ myths });
}
