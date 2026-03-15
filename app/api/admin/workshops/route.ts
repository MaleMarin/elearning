import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

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
      return { id: d.id, moduleId: x.moduleId, title: x.title, description: x.description, peerCount: x.peerCount ?? 2, deadline: x.deadline ?? null, reviewDeadline: x.reviewDeadline ?? null };
    });
    return NextResponse.json(list);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
  }
}
