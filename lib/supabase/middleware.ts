import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getDemoMode } from "@/lib/env";
import { getSupabaseConfig } from "@/lib/config";

/** Rutas que exigen sesión + enrollment activo (acceso a la experiencia de curso). */
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
];
const SKIP_AUTH_PATHS = ["/login", "/registro", "/no-inscrito", "/auth/callback"];

function isPrivateAppPath(pathname: string): boolean {
  return PRIVATE_APP_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function skipAuthCheck(pathname: string): boolean {
  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) return true;
  return SKIP_AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function updateSession(request: NextRequest) {
  if (getDemoMode()) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  let url: string;
  let anonKey: string;
  try {
    const config = getSupabaseConfig();
    url = config.url;
    anonKey = config.anonKey;
  } catch (e) {
    console.error("[middleware] Supabase config missing:", e);
    return NextResponse.next({ request });
  }
  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/panel") && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const role = profile?.role ?? "student";
    if (pathname.startsWith("/admin/cohortes") && role !== "admin") {
      return NextResponse.redirect(new URL("/inicio", request.url));
    }
    if (role !== "admin" && role !== "mentor") {
      return NextResponse.redirect(new URL("/inicio", request.url));
    }
    return response;
  }

  if (skipAuthCheck(pathname)) return response;
  if (!isPrivateAppPath(pathname)) return response;

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

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
    return NextResponse.redirect(new URL("/no-inscrito", origin));
  }

  return response;
}
