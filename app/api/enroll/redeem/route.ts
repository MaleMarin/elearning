import { NextRequest, NextResponse } from "next/server";
import { getDemoMode } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/enroll/redeem
 * Body: { code: string }
 * Canje atómico vía RPC public.redeem_invitation(p_code, p_user_id):
 * valida invitación (existe, is_active, no expirada, uses < max_uses),
 * cohorte activa, capacidad, upsert enrollment + incrementa uses en una transacción (FOR UPDATE).
 */
export async function POST(request: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json({
      ok: true,
      cohortId: "demo-cohort-id",
      enrollmentStatus: "active",
    });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Debes iniciar sesión para canjear un código" },
      { status: 401 }
    );
  }

  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  if (!code) {
    return NextResponse.json(
      { error: "Falta el código de invitación" },
      { status: 400 }
    );
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
