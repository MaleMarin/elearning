/**
 * POST /api/auth/login
 * Demo: body { email, password } -> cookie precisar_session con payload demo firmado.
 * Real: body { idToken } -> verificar con Firebase, session cookie -> precisar_session.
 * Fix 1: rate limit por IP para mitigar fuerza bruta.
 * Arcjet: protección anti-abuso (movida aquí desde middleware para reducir tamaño del Edge).
 */
import { NextRequest, NextResponse } from "next/server";
import arcjet, { tokenBucket, shield } from "@arcjet/next";
import { getDemoMode } from "@/lib/env";
import { checkLoginRateLimit } from "@/lib/rate-limit";
import {
  PRECISAR_SESSION_COOKIE,
  getSessionCookieOptions,
  createDemoSessionCookie,
} from "@/lib/auth/session-cookie";
import {
  logAccessAudit,
  parseDeviceFromUserAgent,
} from "@/lib/services/access-audit";
import { logAudit } from "@/lib/services/audit-logs";
import { logAudit as logGlobalAudit } from "@/lib/services/audit-log";
import {
  checkLoginAttempts,
  recordFailedAttempt,
  clearLoginAttempts,
} from "@/lib/auth/login-attempts";

export const dynamic = "force-dynamic";

const arcjetLogin =
  process.env.ARCJET_KEY &&
  arcjet({
    key: process.env.ARCJET_KEY,
    rules: [
      tokenBucket({ mode: "LIVE", refillRate: 10, interval: 900, capacity: 10 }),
      shield({ mode: "LIVE" }),
    ],
  });

const SESSION_MAX_AGE = 60 * 60 * 24 * 5; // 5 días (Firebase session)
const DEMO_SESSION_MAX_AGE = 60 * 60 * 2; // 2h (demo JWT)

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xri = req.headers.get("x-real-ip");
  if (xri) return xri.trim();
  return "unknown";
}

export async function POST(req: NextRequest) {
  if (arcjetLogin) {
    const decision = await arcjetLogin.protect(req, { requested: 1 });
    if (decision.isDenied()) {
      return NextResponse.json(
        { error: "Demasiados intentos. Espera 15 minutos." },
        { status: 429 }
      );
    }
  }

  const ip = getClientIp(req);
  const { ok: rateOk, remaining } = checkLoginRateLimit(`login:${ip}`);
  if (!rateOk) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera un minuto e intenta de nuevo." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  let emailFromBody: string | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    const idToken = (body.idToken ?? body.token) as string;
    const hasIdToken = idToken && typeof idToken === "string";
    emailFromBody = (body.email as string)?.trim?.();

    // Bloqueo por 5 intentos fallidos (solo si tenemos email)
    if (emailFromBody) {
      const { blocked, remainingMinutes } = await checkLoginAttempts(emailFromBody);
      if (blocked) {
        return NextResponse.json(
          {
            error: `Cuenta bloqueada por demasiados intentos. Intenta de nuevo en ${remainingMinutes ?? 15} minutos.`,
          },
          { status: 429 }
        );
      }
    }

    // Modo demo: cuando está activo o cuando en desarrollo se envía email/password sin idToken
    const isDemoRequest = getDemoMode() || (!hasIdToken && body.email != null && process.env.NODE_ENV === "development");
    if (isDemoRequest && !hasIdToken) {
      const email = (body.email ?? "demo@precisar.local") as string;
      const role = (body.role as string) ?? "student";
      const cookieValue = await createDemoSessionCookie(email, role);
      const res = NextResponse.json({
        ok: true,
        user: { uid: "demo", email, role },
      });
      res.cookies.set(PRECISAR_SESSION_COOKIE, cookieValue, getSessionCookieOptions(DEMO_SESSION_MAX_AGE));
      logAudit("demo", "login", { email, userAgent: req.headers.get("user-agent") ?? undefined }).catch(() => {});
      return res;
    }

    if (!hasIdToken) {
      return NextResponse.json({ error: "Falta idToken" }, { status: 400 });
    }

    const { getFirebaseAdminAuth, getFirebaseAdminFirestore, ensureFirebaseProfile } = await import("@/lib/firebase/admin");
    const auth = getFirebaseAdminAuth();
    const decoded = await auth.verifyIdToken(idToken);
    await ensureFirebaseProfile(decoded.uid, decoded.email ?? null);

    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE * 1000,
    });

    const db = getFirebaseAdminFirestore();
    const profileSnap = await db.collection("profiles").doc(decoded.uid).get();
    const role = (profileSnap.data()?.role as string) ?? "student";

    const res = NextResponse.json({
      ok: true,
      user: {
        uid: decoded.uid,
        email: decoded.email ?? null,
        role,
      },
    });
    res.cookies.set(PRECISAR_SESSION_COOKIE, sessionCookie, getSessionCookieOptions());
    if (!getDemoMode()) {
      const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
      res.cookies.set("audit_session_id", sessionId, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
      });
      const device = parseDeviceFromUserAgent(req.headers.get("user-agent"));
      await logAccessAudit({
        userId: decoded.uid,
        userEmail: decoded.email ?? "",
        action: "login",
        resourceId: "",
        resourceName: "",
        device,
        sessionId,
      });
      logAudit(decoded.uid, "login", { userAgent: req.headers.get("user-agent") ?? undefined }).catch(() => {});
      logGlobalAudit({
        userId: decoded.uid,
        action: "login",
        userAgent: req.headers.get("user-agent") ?? undefined,
      }).catch(() => {});
    }
    if (emailFromBody || decoded.email) {
      await clearLoginAttempts(emailFromBody ?? decoded.email ?? "").catch(() => {});
    }
    return res;
  } catch (e) {
    console.error("[auth/login]", e);
    if (emailFromBody) {
      const { blocked } = await recordFailedAttempt(emailFromBody).catch(() => ({ blocked: false }));
      if (blocked) {
        return NextResponse.json(
          { error: "Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos." },
          { status: 429 }
        );
      }
    }
    return NextResponse.json(
      { error: "Token inválido o expirado" },
      { status: 401 }
    );
  }
}
