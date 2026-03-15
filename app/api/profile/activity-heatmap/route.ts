import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/** GET: últimos 365 días de actividad del alumno (conteo por día desde audit_logs). */
export async function GET(req: NextRequest) {
  let user: { uid: string };
  try {
    user = await getAuthFromRequest(req);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const db = getFirebaseAdminFirestore();
  if (!db) return NextResponse.json({ activity: [] });

  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 364);

  const snap = await db
    .collection("audit_logs")
    .where("userId", "==", user.uid)
    .orderBy("timestamp", "asc")
    .get();

  const docs = snap.docs.filter((doc) => {
    const data = doc.data();
    const ts = data.timestamp?.toDate?.() ?? data.timestamp;
    const t = ts instanceof Date ? ts.getTime() : 0;
    return t >= start.getTime() && t <= end.getTime();
  });

  const byDate: Record<string, number> = {};
  docs.forEach((doc) => {
    const data = doc.data();
    const ts = data.timestamp?.toDate?.() ?? data.timestamp;
    const dateStr = ts instanceof Date ? ts.toISOString().split("T")[0] : "";
    if (dateStr) {
      byDate[dateStr] = (byDate[dateStr] ?? 0) + 1;
    }
  });

  const activity = Object.entries(byDate).map(([date, count]) => ({ date, count }));
  return NextResponse.json({ activity });
}
