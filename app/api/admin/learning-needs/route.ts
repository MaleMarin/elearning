import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ needs: [] });
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 501 });
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    const snap = await getFirebaseAdminFirestore().collection("learningNeeds").orderBy("createdAt", "desc").limit(500).get();
    const needs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ needs });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
