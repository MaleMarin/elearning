import { NextResponse, type NextRequest } from "next/server";
import { useFirebase } from "@/lib/env";
import {
  PRECISAR_SESSION_COOKIE,
  hasSessionCookie,
  getRoleFromCookie,
} from "@/lib/auth/session-cookie-edge";

const PRIVATE_APP_PATHS = [
  "/inicio",
  "/curso",
  "/sesiones-en-vivo",
  "/tareas",
  "/comunidad",
  "/certificado",
  "/cursos",
  "/mi-perfil",
  "/soporte",
  "/onboarding",
];
const SKIP_AUTH_PATHS = ["/login", "/registro", "/no-inscrito", "/auth/callback", "/admin/login"];

function isPrivateAppPath(pathname: string): boolean {
  return PRIVATE_APP_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function skipAuthCheck(pathname: string): boolean {
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname === "/favicon.ico") return true;
  // Evitar que peticiones a assets estáticos (p. ej. /next/static sin _) pasen por lógica de sesión
  if (pathname.startsWith("/next/") || pathname.includes("/static/") || pathname.includes("/chunks/")) return true;
  return SKIP_AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const response = NextResponse.next({ request });

  if (pathname.startsWith("/api")) return response;
  if (skipAuthCheck(pathname)) return response;

  const hasSession = hasSessionCookie(request);

  if (pathname.startsWith("/panel")) {
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  if (pathname.startsWith("/superadmin")) {
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  if (pathname.startsWith("/admin")) {
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // En Edge no decodificamos JWT; role siempre null. Las páginas admin validan rol en servidor.
    const role = getRoleFromCookie(request);
    if (role !== null) {
      if (pathname.startsWith("/admin/cohortes") && role !== "admin") {
        return NextResponse.redirect(new URL("/inicio", request.url));
      }
      if (role !== "admin" && role !== "mentor") {
        return NextResponse.redirect(new URL("/inicio", request.url));
      }
    }
    return response;
  }

  if (!isPrivateAppPath(pathname)) return response;

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!useFirebase()) return response;

  const origin = request.nextUrl.origin;
  const cookieHeader = request.headers.get("cookie") ?? "";
  let enrolled = false;
  try {
    const statusRes = await fetch(`${origin}/api/enroll/status`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    const data = await statusRes.json();
    enrolled = data.enrolled === true;
  } catch {
    enrolled = false;
  }

  if (!enrolled) {
    // En desarrollo permitir ver el dashboard sin inscripción para pruebas
    if (process.env.NODE_ENV === "development") {
      return response;
    }
    return NextResponse.redirect(new URL("/no-inscrito", origin));
  }

  return response;
}
