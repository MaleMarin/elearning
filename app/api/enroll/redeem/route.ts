import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { PRECISAR_SESSION_COOKIE, isDemoCookieValue } from "@/lib/auth/session-cookie";
import * as firebaseContent from "@/lib/services/firebase-content";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function successResponse() {
  return NextResponse.json({
    ok: true,
    cohortId: "demo-cohort-id",
    enrollmentStatus: "active",
  });
}

/**
 * POST /api/enroll/redeem — canjear código de invitación.
 */
export async function POST(request: NextRequest) {
  if (getDemoMode()) return successResponse();

  const cookieValue = request.cookies.get(PRECISAR_SESSION_COOKIE)?.value;
  if (cookieValue && isDemoCookieValue(cookieValue)) return successResponse();

  if (useFirebase()) {
    try {
      const auth = await getAuthFromRequest(request);
      let body: { code?: string };
      try {
        body = await request.json();
      } catch {
        return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
      }
      const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
      if (!code) {
        return NextResponse.json({ error: "Falta el código de invitación" }, { status: 400 });
      }
      const { cohortId } = await firebaseContent.redeemInvitation(code, auth.uid);
      return NextResponse.json({
        ok: true,
        cohortId,
        enrollmentStatus: "active",
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      const status =
        msg.includes("Código no válido") ||
        msg.includes("caducado") ||
        msg.includes("usos disponibles") ||
        msg.includes("no está activ") ||
        msg.includes("no existe")
          ? 400
          : 401;
      return NextResponse.json({ error: msg }, { status });
    }
  }
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión para canjear un código" }, { status: 401 });
  }
  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  if (!code) {
    return NextResponse.json({ error: "Falta el código de invitación" }, { status: 400 });
  }
  const admin = createAdminClient();
  const { data: cohortId, error } = await admin.rpc("redeem_invitation", {
    p_code: code,
    p_user_id: user.id,
  });
  if (error) {
    const msg =
      error.message?.includes("Código no válido") ||
      error.message?.includes("caducado") ||
      error.message?.includes("usos disponibles") ||
      error.message?.includes("no está activo") ||
      error.message?.includes("no está activa") ||
      error.message?.includes("capacidad máxima")
        ? error.message
        : "No se pudo canjear el código. Inténtalo de nuevo.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({
    ok: true,
    cohortId: cohortId as string,
    enrollmentStatus: "active",
  });
}
