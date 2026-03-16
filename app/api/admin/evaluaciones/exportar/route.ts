import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getAuthFromRequest(req);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const db = getFirebaseAdminFirestore();
  const snap = await db.collection("nps_responses").orderBy("timestamp", "desc").get();

  const rows = ["userId,moduloId,score,categoria,fecha"];
  snap.docs.forEach((doc) => {
    const d = doc.data();
    const ts = d.timestamp as { toDate?: () => Date } | string | undefined;
    const fecha = ts && typeof ts === "object" && ts.toDate ? ts.toDate().toISOString() : typeof ts === "string" ? ts : "";
    rows.push(`${d.userId ?? ""},${d.moduloId ?? ""},${d.score ?? ""},${d.category ?? ""},${fecha}`);
  });

  return new NextResponse(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="evaluaciones-politica-digital.csv"',
    },
  });
}
