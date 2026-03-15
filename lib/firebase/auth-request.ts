import { NextRequest } from "next/server";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { PRECISAR_SESSION_COOKIE, verifyDemoSessionCookie, isDemoCookieValue } from "@/lib/auth/session-cookie";

export type AuthUser = { uid: string; email: string | null; role: string };

/**
 * Obtiene el usuario actual a partir de la cookie "precisar_session".
 * Para usar en API routes. Lanza si no hay sesión válida.
 */
export async function getAuthFromRequest(req: NextRequest): Promise<AuthUser> {
  const cookieValue = req.cookies.get(PRECISAR_SESSION_COOKIE)?.value;
  if (!cookieValue) throw new Error("No autorizado");

  if (isDemoCookieValue(cookieValue)) {
    const user = await verifyDemoSessionCookie(cookieValue);
    if (!user) throw new Error("No autorizado");
    return { uid: user.uid, email: user.email, role: user.role };
  }

  const auth = getFirebaseAdminAuth();
  const decoded = await auth.verifySessionCookie(cookieValue, true);
  const uid = decoded.uid;
  const email = decoded.email ?? null;

  const db = getFirebaseAdminFirestore();
  const profileSnap = await db.collection("profiles").doc(uid).get();
  const role = (profileSnap.data()?.role as string) ?? "student";

  return { uid, email, role };
}
