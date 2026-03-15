/**
 * GET /api/auth/require-mfa?email=...
 * Indica si el usuario con ese email debe completar MFA (solo admins).
 * Usado en login cuando Firebase devuelve auth/multi-factor-auth-required.
 */
import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email || typeof email !== "string") {
    return NextResponse.json({ requireMfa: false }, { status: 200 });
  }

  try {
    const db = getFirebaseAdminFirestore();
    const snap = await db.collection("profiles").where("email", "==", email.trim()).limit(1).get();
    const doc = snap.docs[0];
    const role = doc?.data()?.role as string | undefined;
    const requireMfa = role === "admin";
    return NextResponse.json({ requireMfa });
  } catch {
    return NextResponse.json({ requireMfa: false }, { status: 200 });
  }
}
