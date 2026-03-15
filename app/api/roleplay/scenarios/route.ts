/**
 * GET /api/roleplay/scenarios
 * Devuelve la lista de escenarios de roleplay (configurables por admin en Firestore o por defecto).
 */
import { NextResponse } from "next/server";
import { getScenarios } from "@/lib/services/roleplay";

export const dynamic = "force-dynamic";

export async function GET() {
  const scenarios = await getScenarios();
  return NextResponse.json({ scenarios });
}
