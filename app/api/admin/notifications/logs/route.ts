import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";

export const dynamic = "force-dynamic";

/** GET: historial de notificaciones (message_logs). Solo admin. Usa Supabase si está configurado. */
export async function GET(req: NextRequest) {
  const auth = await getAuthFromRequest(req);
  if (!auth?.uid || auth.role !== "admin") {
    return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { searchParams } = new URL(req.url);
    const cohortId = searchParams.get("cohortId");
    const channel = searchParams.get("channel");

    let q = admin.from("message_logs").select("*").order("created_at", { ascending: false }).limit(500);
    if (cohortId) q = q.eq("cohort_id", cohortId);
    if (channel) q = q.eq("channel", channel);
    const { data, error } = await q;
    if (error) throw error;
    return NextResponse.json({ logs: data ?? [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg.includes("Missing") || msg.includes("SUPABASE")) return NextResponse.json({ logs: [] });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
