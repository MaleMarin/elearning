/**
 * GET /api/admin/audit-logs — Lista registros de auditoría de accesos (solo admin).
 * Query: page (1-based), limit (default 20), userId?, action?, dateFrom?, dateTo? (ISO).
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import type { Timestamp } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json({ logs: [], total: 0, page: 1, limit: 20 });
  }

  let role: string;
  try {
    const auth = await getAuthFromRequest(req);
    role = auth.role;
  } catch {
    return NextResponse.json({ error: "no_session" }, { status: 401 });
  }
  if (role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const userId = searchParams.get("userId")?.trim() || undefined;
  const action = searchParams.get("action")?.trim() || undefined;
  const dateFrom = searchParams.get("dateFrom")?.trim() || undefined;
  const dateTo = searchParams.get("dateTo")?.trim() || undefined;

  try {
    const db = getFirebaseAdminFirestore();
    const maxFetch = 500;
    const snap = await db.collection("audit_logs").orderBy("timestamp", "desc").limit(maxFetch).get();
    let docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (userId) docs = docs.filter((d) => (d as { userId?: string }).userId === userId);
    if (action) docs = docs.filter((d) => (d as { action?: string }).action === action);
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      if (!isNaN(from)) docs = docs.filter((d) => ((d as { timestamp?: Timestamp }).timestamp?.toMillis?.() ?? 0) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime();
      if (!isNaN(to)) docs = docs.filter((d) => ((d as { timestamp?: Timestamp }).timestamp?.toMillis?.() ?? 0) <= to);
    }

    const total = docs.length;
    const start = (page - 1) * limit;
    const pageDocs = docs.slice(start, start + limit);

    const logs = pageDocs.map((d) => {
      const data = d as Record<string, unknown>;
      const t = data.timestamp as Timestamp | undefined;
      return {
        id: d.id,
        userId: (data.userId as string) ?? (data.user_id as string) ?? "",
        userEmail: (data.userEmail as string) ?? "",
        action: (data.action as string) ?? "",
        resourceId: (data.resourceId as string) ?? "",
        resourceName: (data.resourceName as string) ?? "",
        timestamp: t?.toDate?.()?.toISOString() ?? (data.created_at as Date)?.toString?.() ?? null,
        device: (data.device as { browser: string; os: string; isMobile: boolean }) ?? null,
        sessionId: (data.sessionId as string) ?? "",
      };
    });

    return NextResponse.json({
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (e) {
    console.error("[admin/audit-logs]", e);
    return NextResponse.json({ error: "Error al cargar auditoría" }, { status: 500 });
  }
}
