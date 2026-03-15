/**
 * GET /api/auth/demo
 * Crea sesión demo y redirige a /inicio. Sirve para el botón "Modo demo" del login.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode } from "@/lib/env";
import {
  PRECISAR_SESSION_COOKIE,
  getSessionCookieOptions,
  createDemoSessionCookie,
} from "@/lib/auth/session-cookie";
import { logAudit } from "@/lib/services/audit-logs";

export const dynamic = "force-dynamic";

const DEMO_SESSION_MAX_AGE = 60 * 60 * 2; // 2h

export async function GET(req: NextRequest) {
  const isDemo =
    getDemoMode() ||
    process.env.NODE_ENV === "development";

  if (!isDemo) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const cookieValue = await createDemoSessionCookie("demo@precisar.local", "student");
    const redirect = NextResponse.redirect(new URL("/inicio", req.url), 302);
    redirect.cookies.set(PRECISAR_SESSION_COOKIE, cookieValue, getSessionCookieOptions(DEMO_SESSION_MAX_AGE));
    logAudit("demo", "login", { email: "demo@precisar.local", via: "demo-link" }).catch(() => {});
    return redirect;
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}
