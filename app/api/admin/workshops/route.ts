import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import * as workshopService from "@/lib/services/workshop";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json([
      { id: "w1", moduleId: "m1", title: "Taller Módulo 1", description: "Entrega y evaluación entre pares.", peerCount: 2, deadline: null, reviewDeadline: null },
    ]);
  }
  if (!useFirebase()) return NextResponse.json([]);
  try {
    await getAuthFromRequest(req);
    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get("moduleId") ?? undefined;
    let q = getFirebaseAdminFirestore().collection("workshops").orderBy("updatedAt", "desc");
    if (moduleId) q = q.where("moduleId", "==", moduleId);
    const snap = await q.get();
    const list = snap.docs.map((d) => {
      const x = d.data();
      return { id: d.id, moduleId: x.moduleId, title: x.title, description: x.description, rubric: x.rubric ?? [], peerCount: x.peerCount ?? 2, deadline: x.deadline ?? null, reviewDeadline: x.reviewDeadline ?? null };
    });
    return NextResponse.json(list);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
  }
}

export async function POST(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ error: "Demo" }, { status: 400 });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    const moduleId = (body.moduleId as string)?.trim();
    const title = (body.title as string)?.trim();
    const description = (body.description as string)?.trim() ?? "";
    const rubric = Array.isArray(body.rubric)
      ? (body.rubric as { id: string; label: string; maxScore: number }[]).map((r) => ({ id: r.id || `c-${Math.random().toString(36).slice(2)}`, label: String(r.label ?? ""), maxScore: Number(r.maxScore) || 10 }))
      : [];
    const deadline = (body.deadline as string)?.trim() || null;
    const reviewDeadline = (body.reviewDeadline as string)?.trim() || null;
    const peerCount = Math.max(1, Math.min(10, Number(body.peerCount) || 2));
    if (!moduleId || !title) return NextResponse.json({ error: "moduleId y title requeridos" }, { status: 400 });
    const w = await workshopService.createWorkshop({ moduleId, title, description, rubric, deadline, reviewDeadline, peerCount });
    return NextResponse.json(w);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
