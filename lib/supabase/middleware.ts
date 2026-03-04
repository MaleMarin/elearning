import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getDemoMode } from "@/lib/env";
import { getSupabaseConfig } from "@/lib/config";

const PLATFORM_PATHS = [
  "/",
  "/cursos",
  "/sesiones",
  "/tareas",
  "/comunidad",
  "/certificado",
  "/soporte",
  "/perfil",
  "/panel",
];
const SKIP_ENROLLMENT_PATHS = ["/login", "/no-inscrito", "/auth/callback"];

function isPlatformPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PLATFORM_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function skipEnrollmentCheck(pathname: string): boolean {
  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) return true;
  return SKIP_ENROLLMENT_PATHS.includes(pathname);
}

export async function updateSession(request: NextRequest) {
  if (getDemoMode()) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const { url, anonKey } = getSupabaseConfig();
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

  if (skipEnrollmentCheck(pathname)) return response;
  if (!isPlatformPath(pathname)) return response;

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
