import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/** GET: estadísticas de notificaciones. Solo admin. */
export async function GET(req: NextRequest) {
  const auth = await getAuthFromRequest(req);
  if (!auth?.uid || auth.role !== "admin") {
    return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
  }

  const db = getFirebaseAdminFirestore();
  const pushSnap = await db.collection("pushSubscriptions").count().get();
  const pushActive = pushSnap.data().count ?? 0;

  const profilesSnap = await db.collection("profiles").count().get();
  const totalUsers = profilesSnap.data().count ?? 0;

  let whatsappSentMonth = 0;
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
      const { count, error } = await admin
      .from("message_logs")
      .select("*", { count: "exact", head: true })
      .eq("channel", "whatsapp")
      .gte("created_at", start.toISOString());
    if (!error && count != null) whatsappSentMonth = count;
  } catch {
    // Supabase no configurado
  }

  return NextResponse.json({
    pushActive,
    totalUsers,
    whatsappSentMonth,
  });
}
