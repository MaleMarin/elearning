/**
 * GET /api/superadmin/me — Comprueba si el usuario actual es superadmin.
 * Requiere sesión. Devuelve 403 si no es superadmin.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getSuperadminUids, getSuperadminEmail } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    const uids = getSuperadminUids();
    const email = getSuperadminEmail();
    const allowedByUid = uids.length > 0 && uids.includes(auth.uid);
    const allowedByEmail = email && auth.email?.toLowerCase() === email.toLowerCase();
    if (!allowedByUid && !allowedByEmail) {
      return NextResponse.json({ error: "Solo superadmin" }, { status: 403 });
    }
    return NextResponse.json({ ok: true, email: auth.email, uid: auth.uid });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
