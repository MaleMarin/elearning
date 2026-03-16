import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getAuthFromRequest(req);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const db = getFirebaseAdminFirestore();
  const snap = await db.collection("nps_responses").get();
  const responses = snap.docs.map((d) => d.data());

  if (responses.length === 0) {
    return NextResponse.json({ nps: 0, promotores: 0, pasivos: 0, detractores: 0, total: 0 });
  }

  const total = responses.length;
  const promotores = responses.filter((r) => (r.score ?? 0) >= 9).length;
  const pasivos = responses.filter((r) => (r.score ?? 0) >= 7 && (r.score ?? 0) <= 8).length;
  const detractores = responses.filter((r) => (r.score ?? 0) <= 6).length;
  const nps = Math.round(((promotores / total) * 100 - (detractores / total) * 100));

  return NextResponse.json({
    nps,
    promotores: Math.round((promotores / total) * 100),
    pasivos: Math.round((pasivos / total) * 100),
    detractores: Math.round((detractores / total) * 100),
    total,
  });
}
