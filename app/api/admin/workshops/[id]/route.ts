import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { useFirebase } from "@/lib/env";
import * as workshopService from "@/lib/services/workshop";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    await getAuthFromRequest(req);
    const { id } = await params;
    const w = await workshopService.getWorkshop(id);
    if (!w) return NextResponse.json({ error: "Taller no encontrado" }, { status: 404 });
    return NextResponse.json(w);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const rubric = Array.isArray(body.rubric)
      ? (body.rubric as { id: string; label: string; maxScore: number }[]).map((r) => ({ id: r.id || `c-${Math.random().toString(36).slice(2)}`, label: String(r.label ?? ""), maxScore: Number(r.maxScore) || 10 }))
      : undefined;
    const w = await workshopService.updateWorkshop(id, {
      moduleId: (body.moduleId as string)?.trim(),
      title: (body.title as string)?.trim(),
      description: (body.description as string)?.trim(),
      rubric,
      deadline: (body.deadline as string)?.trim() || null,
      reviewDeadline: (body.reviewDeadline as string)?.trim() || null,
      peerCount: body.peerCount !== undefined ? Math.max(1, Math.min(10, Number(body.peerCount) || 2)) : undefined,
    });
    if (!w) return NextResponse.json({ error: "Taller no encontrado" }, { status: 404 });
    return NextResponse.json(w);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
