import { NextRequest, NextResponse } from "next/server";
import { getDemoMode } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/enroll/redeem
 * Body: { code: string }
 * Valida el código de invitación y crea enrollment (cohort_members) si hay cupo.
 * Solo usuarios autenticados; no requiere estar inscrito.
 */
export async function POST(request: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ ok: true, cohortId: "demo-cohort-id" });

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

  const { data: inv, error: invError } = await admin
    .from("invitations")
    .select("id, cohort_id, max_uses, uses, expires_at")
    .eq("code", code)
    .single();

  if (invError || !inv) {
    return NextResponse.json({ error: "Código no válido o no encontrado" }, { status: 404 });
  }

  if (inv.uses >= inv.max_uses) {
    return NextResponse.json({ error: "Este código ya no tiene usos disponibles" }, { status: 400 });
  }

  if (inv.expires_at && new Date(inv.expires_at) < new Date()) {
    return NextResponse.json({ error: "Este código ha caducado" }, { status: 400 });
  }

  const { error: memberError } = await admin
    .from("cohort_members")
    .insert({
      cohort_id: inv.cohort_id,
      user_id: user.id,
      role: "student",
    });

  if (memberError) {
    if (memberError.code === "23505") {
      return NextResponse.json({ error: "Ya estás inscrito en esta cohorte" }, { status: 400 });
    }
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  const { error: updateError } = await admin
    .from("invitations")
    .update({ uses: inv.uses + 1 })
    .eq("id", inv.id);

  if (updateError) {
    return NextResponse.json({ error: "Error al actualizar el código" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, cohortId: inv.cohort_id });
}
