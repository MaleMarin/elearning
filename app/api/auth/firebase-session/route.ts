import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdminAuth, ensureFirebaseProfile } from "@/lib/firebase/admin";
import { getDemoMode } from "@/lib/env";

export const dynamic = "force-dynamic";

const SESSION_COOKIE_NAME = "firebase-session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 5; // 5 días

/**
 * POST /api/auth/firebase-session
 * Body: { idToken: string }
 * Verifica el idToken con Firebase Admin, crea session cookie y la setea en la respuesta.
 */
export async function POST(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json({ ok: true });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const idToken = (body.idToken ?? body.token) as string;
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Falta idToken" }, { status: 400 });
    }

    const auth = getFirebaseAdminAuth();
    const decoded = await auth.verifyIdToken(idToken);
    await ensureFirebaseProfile(decoded.uid, decoded.email ?? null);

    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE * 1000 });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
    return res;
  } catch (e) {
    console.error("[firebase-session]", e);
    return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 });
  }
}

/**
 * DELETE /api/auth/firebase-session
 * Cierra sesión (borra la cookie).
 */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return res;
}
