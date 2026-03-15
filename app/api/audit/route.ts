/**
 * POST /api/audit — Registra evento de acceso (lesson_view, lesson_complete, course_view).
 * En modo demo no registra. Requiere sesión válida.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode } from "@/lib/env";
import { PRECISAR_SESSION_COOKIE, verifyDemoSessionCookie, isDemoCookieValue } from "@/lib/auth/session-cookie";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import {
  logAccessAudit,
  parseDeviceFromUserAgent,
  type AccessAuditAction,
} from "@/lib/services/access-audit";

export const dynamic = "force-dynamic";

const AUDIT_SESSION_COOKIE = "audit_session_id";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

function getOrCreateSessionId(req: NextRequest, res: NextResponse): string {
  const existing = req.cookies.get(AUDIT_SESSION_COOKIE)?.value;
  if (existing) return existing;
  const newId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  res.cookies.set(AUDIT_SESSION_COOKIE, newId, {
    httpOnly: true,
    path: "/",
    maxAge: SESSION_MAX_AGE,
    sameSite: "lax",
  });
  return newId;
}

export async function POST(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ ok: true });

  const cookieValue = req.cookies.get(PRECISAR_SESSION_COOKIE)?.value;
  if (!cookieValue) return NextResponse.json({ error: "no_session" }, { status: 401 });

  let userId: string;
  let userEmail: string;

  if (isDemoCookieValue(cookieValue)) {
    const demo = await verifyDemoSessionCookie(cookieValue);
    if (!demo) return NextResponse.json({ error: "invalid_session" }, { status: 401 });
    userId = demo.uid;
    userEmail = demo.email ?? "";
  } else {
    try {
      const auth = getFirebaseAdminAuth();
      const decoded = await auth.verifySessionCookie(cookieValue, true);
      userId = decoded.uid;
      userEmail = decoded.email ?? "";
    } catch {
      return NextResponse.json({ error: "invalid_session" }, { status: 401 });
    }
  }

  const body = await req.json().catch(() => ({}));
  const action = (body.action as AccessAuditAction) ?? "lesson_view";
  const resourceId = (body.resourceId as string) ?? "";
  const resourceName = (body.resourceName as string) ?? "";

  const allowed: AccessAuditAction[] = ["lesson_view", "lesson_complete", "course_view"];
  if (!allowed.includes(action)) return NextResponse.json({ error: "invalid_action" }, { status: 400 });

  const res = NextResponse.json({ ok: true });
  const sessionId = getOrCreateSessionId(req, res);
  const userAgent = req.headers.get("user-agent");
  const device = parseDeviceFromUserAgent(userAgent);

  await logAccessAudit({
    userId,
    userEmail,
    action,
    resourceId,
    resourceName,
    device,
    sessionId,
  });

  return res;
}
