/**
 * GET: listar micro-simulaciones. POST: crear.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode } from "@/lib/env";
import * as simulations from "@/lib/services/simulations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const moduleId = searchParams.get("moduleId") ?? undefined;
  const lessonId = searchParams.get("lessonId") ?? undefined;
  const list = await simulations.listSimulations(moduleId ? { moduleId } : lessonId ? { lessonId } : undefined);
  return NextResponse.json({ simulations: list });
}

export async function POST(req: NextRequest) {
  if (getDemoMode()) {
    const body = await req.json();
    const sim = await simulations.createSimulation({
      scenario: (body.scenario as string) ?? "",
      options: Array.isArray(body.options) ? body.options : [],
      reflection: (body.reflection as string) ?? "",
      moduleId: (body.moduleId as string) ?? null,
      lessonId: (body.lessonId as string) ?? null,
      order: typeof body.order === "number" ? body.order : 0,
    });
    return NextResponse.json({ simulation: sim });
  }
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo admin" }, { status: 403 });
    const body = await req.json();
    const sim = await simulations.createSimulation({
      scenario: (body.scenario as string) ?? "",
      options: Array.isArray(body.options) ? body.options : [],
      reflection: (body.reflection as string) ?? "",
      moduleId: (body.moduleId as string) ?? null,
      lessonId: (body.lessonId as string) ?? null,
      order: typeof body.order === "number" ? body.order : 0,
    });
    return NextResponse.json({ simulation: sim });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}
