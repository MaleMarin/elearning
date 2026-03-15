/**
 * GET /api/auth/me
 * Lee cookie "precisar_session". Si no existe -> 401.
 * Demo: verifica payload firmado y devuelve user demo.
 * Real: verifySessionCookie y devuelve user + role (profiles).
 */
import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { getDemoMode } from "@/lib/env";
import { PRECISAR_SESSION_COOKIE, verifyDemoSessionCookie, isDemoCookieValue } from "@/lib/auth/session-cookie";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const cookieValue = req.cookies.get(PRECISAR_SESSION_COOKIE)?.value;
  if (!cookieValue) {
    return NextResponse.json({ error: "no_session" }, { status: 401 });
  }

  if (getDemoMode() || isDemoCookieValue(cookieValue)) {
    const user = await verifyDemoSessionCookie(cookieValue);
    if (!user) return NextResponse.json({ error: "invalid_session" }, { status: 401 });
    return NextResponse.json({ uid: user.uid, email: user.email, role: user.role, mfaEnabled: false });
  }

  try {
    const auth = getFirebaseAdminAuth();
    const decoded = await auth.verifySessionCookie(cookieValue, true);
    const uid = decoded.uid;
    const email = decoded.email ?? null;

    const db = getFirebaseAdminFirestore();
    const profileSnap = await db.collection("profiles").doc(uid).get();
    const role = (profileSnap.data()?.role as string) ?? "student";

    let mfaEnabled = false;
    try {
      const userRecord = await auth.getUser(uid);
      mfaEnabled = (userRecord.multiFactor?.enrolledFactors?.length ?? 0) > 0;
    } catch {
      // ignore
    }

    return NextResponse.json({ uid, email, role, mfaEnabled });
  } catch {
    return NextResponse.json({ error: "invalid_session" }, { status: 401 });
  }
}
