/**
 * Helpers de sesión seguros para Edge Runtime (middleware).
 * NO importar jose ni ninguna API de Node; solo comprobaciones por string.
 * La verificación JWT real se hace en rutas API con lib/auth/session-cookie.ts.
 */

import type { NextRequest } from "next/server";

export const PRECISAR_SESSION_COOKIE = "precisar_session";

const DEMO_PREFIX = "demo.";

export function isDemoCookieValue(value: string): boolean {
  return value.startsWith(DEMO_PREFIX);
}

/**
 * En Edge no verificamos el JWT; considerar "tiene sesión" si existe la cookie.
 * Las rutas API que necesiten rol/identidad verifican con session-cookie.ts (jose).
 */
export function hasSessionCookie(request: NextRequest): boolean {
  const value = request.cookies.get(PRECISAR_SESSION_COOKIE)?.value;
  return Boolean(value);
}

/**
 * En Edge no decodificamos el JWT; devolvemos null. Las páginas admin validan rol en servidor.
 */
export function getRoleFromCookie(_request: NextRequest): null {
  return null;
}
