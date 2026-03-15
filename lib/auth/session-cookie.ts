/**
 * Cookie de sesión única "precisar_session".
 * Demo: JWT con jose, expiración 2h. httpOnly, secure, sameSite en getSessionCookieOptions().
 * Real: valor opaco de Firebase session cookie.
 */

import { SignJWT, jwtVerify } from "jose";

export const PRECISAR_SESSION_COOKIE = "precisar_session";

const DEMO_PREFIX = "demo.";
/** Demo session: 2 horas en segundos */
const DEMO_SESSION_MAX_AGE = 60 * 60 * 2; // 2h

export interface DemoUser {
  uid: string;
  email: string;
  role: string;
}

/** Preferir DEMO_SESSION_SECRET; fallback a SESSION_SECRET. Mín 32 chars en producción. */
function getSecret(): Uint8Array {
  const demoSecret = process.env.DEMO_SESSION_SECRET;
  const sessionSecret = process.env.SESSION_SECRET;
  const s =
    demoSecret && demoSecret.length >= 32
      ? demoSecret
      : sessionSecret && sessionSecret.length >= 32
        ? sessionSecret
        : process.env.NODE_ENV === "production"
          ? null
          : "precisar-dev-secret-change-in-production";
  if (process.env.NODE_ENV === "production") {
    if (!s || s.length < 32) {
      throw new Error(
        "DEMO_SESSION_SECRET o SESSION_SECRET debe tener al menos 32 caracteres en producción. Genera uno con: openssl rand -base64 32"
      );
    }
  }
  return new TextEncoder().encode(s ?? "precisar-dev-secret");
}

export function getSessionCookieOptions(maxAgeSeconds = DEMO_SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/** Genera el valor de la cookie para sesión demo (JWT con jose, expiración 2h). */
export async function createDemoSessionCookie(email: string, role = "admin"): Promise<string> {
  const secret = getSecret();
  const token = await new SignJWT({
    userId: "demo",
    email,
    role,
    demo: true,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);
  return DEMO_PREFIX + token;
}

/** Verifica y decodifica cookie demo. Devuelve null si no es demo, JWT inválido o expirado. */
export async function verifyDemoSessionCookie(cookieValue: string): Promise<DemoUser | null> {
  if (!cookieValue.startsWith(DEMO_PREFIX)) return null;
  const token = cookieValue.slice(DEMO_PREFIX.length);
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const userId = payload.userId as string;
    const email = payload.email as string;
    const role = (payload.role as string) ?? "admin";
    if (userId === "demo" && email != null) {
      return { uid: userId, email, role };
    }
  } catch {
    // JWT invalid or expired
  }
  return null;
}

/** Indica si el valor de la cookie es formato demo (para no pasarlo a Firebase). */
export function isDemoCookieValue(value: string): boolean {
  return value.startsWith(DEMO_PREFIX);
}
