/**
 * POST /api/auth/logout
 * Registra auditoría logout (modo real) y borra la cookie "precisar_session".
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoMode } from "@/lib/env";
import { PRECISAR_SESSION_COOKIE, verifyDemoSessionCookie, isDemoCookieValue } from "@/lib/auth/session-cookie";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import {
  logAccessAudit,
  parseDeviceFromUserAgent,
} from "@/lib/services/access-audit";
import { logAudit } from "@/lib/services/audit-logs";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  const cookieValue = req.cookies.get(PRECISAR_SESSION_COOKIE)?.value;
  const sessionId = req.cookies.get("audit_session_id")?.value ?? "logout";

  if (!getDemoMode() && cookieValue && !isDemoCookieValue(cookieValue)) {
    try {
      const auth = getFirebaseAdminAuth();
      const decoded = await auth.verifySessionCookie(cookieValue, false);
      const device = parseDeviceFromUserAgent(req.headers.get("user-agent"));
      await logAccessAudit({
        userId: decoded.uid,
        userEmail: decoded.email ?? "",
        action: "logout",
        resourceId: "",
        resourceName: "",
        device,
        sessionId,
      });
      logAudit(decoded.uid, "logout", { userAgent: req.headers.get("user-agent") ?? undefined }).catch(() => {});
    } catch {
      // Session invalid or expired, skip audit
    }
  } else if (cookieValue && isDemoCookieValue(cookieValue)) {
    const { verifyDemoSessionCookie } = await import("@/lib/auth/session-cookie");
    const demo = await verifyDemoSessionCookie(cookieValue);
    if (demo) logAudit("demo", "logout", {}).catch(() => {});
  }

  res.cookies.set(PRECISAR_SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0, sameSite: "lax" });
  res.cookies.set("audit_session_id", "", { httpOnly: true, path: "/", maxAge: 0, sameSite: "lax" });
  return res;
}
