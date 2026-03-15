/**
 * GET / PATCH / DELETE una micro-simulación.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode } from "@/lib/env";
import * as simulations from "@/lib/services/simulations";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sim = await simulations.getSimulation(id);
  if (!sim) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json(sim);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (getDemoMode()) {
    const body = await req.json();
    const sim = await simulations.updateSimulation(id, {
      scenario: body.scenario,
      options: body.options,
      reflection: body.reflection,
      moduleId: body.moduleId,
      lessonId: body.lessonId,
      order: body.order,
    });
    return NextResponse.json(sim);
  }
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo admin" }, { status: 403 });
    const body = await req.json();
    const sim = await simulations.updateSimulation(id, {
      scenario: body.scenario,
      options: body.options,
      reflection: body.reflection,
      moduleId: body.moduleId,
      lessonId: body.lessonId,
      order: body.order,
    });
    return NextResponse.json(sim);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getDemoMode()) {
    const auth = await getAuthFromRequest(_req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo admin" }, { status: 403 });
    await simulations.deleteSimulation(id);
  }
  return NextResponse.json({ ok: true });
}
