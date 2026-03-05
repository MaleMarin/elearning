import { NextRequest, NextResponse } from "next/server";
import { getDemoMode } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado", status: 401 as const };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return { error: "Solo administradores", status: 403 as const };
  return { supabase };
}

/**
 * GET /api/admin/cohorts/[id]/invitations — listar invitaciones de una cohorte.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: cohortId } = await params;
  if (getDemoMode()) {
    return NextResponse.json([
      {
        id: "demo-inv-id",
        code: "DEMO-1234",
        cohort_id: cohortId,
        max_uses: 10,
        uses: 0,
        expires_at: null,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ]);
  }

  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data, error } = await auth.supabase
    .from("invitations")
    .select("id, code, cohort_id, max_uses, uses, expires_at, is_active, created_at")
    .eq("cohort_id", cohortId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}
