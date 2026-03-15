import { NextRequest, NextResponse } from "next/server";
import arcjet, { tokenBucket, shield } from "@arcjet/next";
import { updateSession } from "@/lib/supabase/middleware";

const aj =
  process.env.ARCJET_KEY &&
  arcjet({
    key: process.env.ARCJET_KEY,
    rules: [
      tokenBucket({
        mode: "LIVE",
        refillRate: 10,
        interval: 900,
        capacity: 10,
      }),
      shield({ mode: "LIVE" }),
    ],
  });

export const config = {
  matcher: [
    "/api/auth/:path*",
    "/((?!_next/static|_next/image|favicon.ico|monitoring|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

/** Subdominios que no se tratan como tenant (dominio principal). */
const MAIN_HOSTS = ["www", "politicadigital", "app", "precisar", "elearningpd"];

function getTenantIdFromHost(request: NextRequest): string | null {
  const host = request.headers.get("host") ?? "";
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) return null;
  const subdomain = host.split(".")[0]?.toLowerCase().trim();
  if (!subdomain) return null;
  if (MAIN_HOSTS.includes(subdomain)) return null;
  return subdomain;
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/auth") && aj) {
    const decision = await aj.protect(request, { requested: 1 });
    if (decision.isDenied()) {
      return NextResponse.json(
        { error: "Demasiados intentos. Espera 15 minutos." },
        { status: 429 }
      );
    }
  }

  try {
    const tenantId = getTenantIdFromHost(request);
    const requestHeaders = new Headers(request.headers);
    if (tenantId) requestHeaders.set("x-tenant-id", tenantId);

    const requestWithTenant = new NextRequest(request.url, {
      headers: requestHeaders,
      method: request.method,
    });
    return await updateSession(requestWithTenant);
  } catch (err) {
    console.error("[middleware]", err);
    return NextResponse.next({ request });
  }
}
