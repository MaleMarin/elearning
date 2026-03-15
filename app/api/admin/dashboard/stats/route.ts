/**
 * GET /api/admin/dashboard/stats
 * Métricas principales del dashboard admin. Solo admin.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json({
      alumnosActivos: 124,
      tasaCompletacion: "34%",
      nps: 8.4,
      certificadosEmitidos: 38,
      trendAlumnos: "+12 esta semana",
      trendTasa: "+5% vs semana pasada",
      trendNps: "↑ 0.3",
      trendCertificados: "6 esta semana",
    });
  }
  try {
    const auth = await getAuthFromRequest(req);
    if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    if (!useFirebase()) {
      return NextResponse.json({
        alumnosActivos: 0,
        tasaCompletacion: "0%",
        nps: 0,
        certificadosEmitidos: 0,
        trendAlumnos: "",
        trendTasa: "",
        trendNps: "",
        trendCertificados: "",
      });
    }
    const db = getFirebaseAdminFirestore();
    const [enrollmentsSnap, certsSnap] = await Promise.all([
      db.collection("enrollments").where("status", "==", "active").get(),
      db.collection("certificate_by_id").get(),
    ]);
    const uniqueUsers = new Set(enrollmentsSnap.docs.map((d) => d.data().user_id).filter(Boolean));
    const alumnosActivos = uniqueUsers.size;
    const certificadosEmitidos = certsSnap.size;
    return NextResponse.json({
      alumnosActivos,
      tasaCompletacion: alumnosActivos > 0 ? `${Math.round((certificadosEmitidos / alumnosActivos) * 100)}%` : "0%",
      nps: 0,
      certificadosEmitidos,
      trendAlumnos: "",
      trendTasa: "",
      trendNps: "",
      trendCertificados: "",
    });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
