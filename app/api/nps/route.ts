import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let user: { uid: string };
  try {
    user = await getAuthFromRequest(req);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const moduloId = body.moduloId as string;
  const score = body.score as number;
  if (!moduloId || typeof score !== "number" || score < 1 || score > 10) {
    return NextResponse.json({ error: "Falta moduloId o score (1-10)" }, { status: 400 });
  }
  const db = getFirebaseAdminFirestore();
  const category =
    score >= 9 ? "promoter" : score >= 7 ? "passive" : "detractor";
  await db.collection("nps_responses").add({
    userId: user.uid,
    moduloId,
    score,
    timestamp: new Date(),
    category,
  });
  return NextResponse.json({ success: true });
}
