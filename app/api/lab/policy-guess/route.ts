/**
 * GET: un caso aleatorio de "Adivina la política pública" (pistas progresivas).
 */
import { NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode } from "@/lib/env";
import * as labPolicy from "@/lib/services/lab-policy";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!getDemoMode()) {
    try {
      await getAuthFromRequest(req as import("next/server").NextRequest);
    } catch {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }
  const policyCase = await labPolicy.getRandomCase();
  return NextResponse.json(policyCase);
}
