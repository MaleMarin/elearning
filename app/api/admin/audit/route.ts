/**
 * GET /api/admin/audit — Lista registros de auditoría (solo admin).
 * Fuente: Firestore audit_logs.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import type { Timestamp } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthFromRequest(req);
    if (user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const db = getFirebaseAdminFirestore();
    const snap = await db
      .collection("audit_logs")
      .orderBy("timestamp", "desc")
      .limit(200)
      .get();
    const logs = snap.docs.map((d) => {
      const data = d.data();
      const t = data.timestamp as Timestamp | undefined;
      const date =
        (data.date as string) ??
        (t?.toDate?.()?.toISOString().split("T")[0] ?? "");
      return {
        id: d.id,
        userId: (data.userId as string) ?? "",
        action: (data.action as string) ?? "",
        resourceId: (data.resourceId as string) ?? "",
        timestamp: t ?? null,
        date,
      };
    });
    return NextResponse.json({ logs });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
