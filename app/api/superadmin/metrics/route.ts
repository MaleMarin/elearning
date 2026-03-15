/**
 * GET /api/superadmin/metrics — Métricas globales (total alumnos, cursos, certificados). Solo superadmin.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getSuperadminUids, getSuperadminEmail, getDemoMode, useFirebase } from "@/lib/env";
import * as tenantService from "@/lib/services/tenant";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

function isSuperadmin(uid: string, email: string | null): boolean {
  const uids = getSuperadminUids();
  const adminEmail = getSuperadminEmail();
  if (uids.length > 0 && uids.includes(uid)) return true;
  if (adminEmail && email?.toLowerCase() === adminEmail.toLowerCase()) return true;
  return false;
}

export async function GET(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json({
      totalAlumnos: 0,
      totalCursos: 0,
      totalCertificados: 0,
      totalTenants: 0,
    });
  }
  if (!useFirebase()) return NextResponse.json({ error: "No disponible" }, { status: 404 });
  try {
    const auth = await getAuthFromRequest(req);
    if (!isSuperadmin(auth.uid, auth.email)) return NextResponse.json({ error: "Solo superadmin" }, { status: 403 });

    const tenants = await tenantService.listTenants();
    const totalAlumnos = tenants.reduce((s, t) => s + t.alumnos, 0);

    const db = getFirebaseAdminFirestore();
    const [coursesSnap, certSnap] = await Promise.all([
      db.collection("courses").count().get(),
      db.collection("certificate_by_id").count().get(),
    ]);

    return NextResponse.json({
      totalAlumnos,
      totalCursos: coursesSnap.data().count ?? 0,
      totalCertificados: certSnap.data().count ?? 0,
      totalTenants: tenants.length,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
