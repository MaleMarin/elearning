/**
 * GET: lista escenarios (admin). POST: crear/actualizar.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import * as roleplay from "@/lib/services/roleplay";

export const dynamic = "force-dynamic";

export async function GET() {
  if (getDemoMode()) return NextResponse.json({ scenarios: roleplay.DEFAULT_ROLEPLAY_SCENARIOS });
  const scenarios = await roleplay.getScenarios();
  return NextResponse.json({ scenarios });
}

export async function POST(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ error: "Demo" }, { status: 400 });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo admin" }, { status: 403 });
    const body = await req.json();
    const scenario = await roleplay.saveScenario({
      id: body.id ?? undefined,
      title: (body.title as string) ?? "",
      characterPrompt: (body.characterPrompt as string) ?? "",
      openingLine: (body.openingLine as string) ?? "",
      order: typeof body.order === "number" ? body.order : 0,
    });
    return NextResponse.json({ scenario });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}
