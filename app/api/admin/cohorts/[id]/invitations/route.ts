import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function requireAdminSupabase() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado", status: 401 as const };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: "Solo administradores", status: 403 as const };
  return { supabase };
}

/**
 * GET /api/admin/cohorts/[id]/invitations
 */
export async function GET(
  req: NextRequest,
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
  if (useFirebase()) {
    try {
      const auth = await getAuthFromRequest(req);
      if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
      const list = await firebaseContent.listInvitations(cohortId);
      return NextResponse.json(
        list.map((inv) => ({
          id: inv.id,
          code: inv.code,
          cohort_id: inv.cohort_id,
          max_uses: inv.max_uses ?? 1,
          uses: inv.uses ?? 0,
          expires_at: inv.expires_at ?? null,
          is_active: inv.is_active !== false,
          created_at: typeof inv.created_at === "string" ? inv.created_at : (inv.created_at as { toDate?: () => Date })?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
        }))
      );
    } catch {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }
  const auth = await requireAdminSupabase();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { data, error } = await auth.supabase
    .from("invitations")
    .select("id, code, cohort_id, max_uses, uses, expires_at, is_active, created_at")
    .eq("cohort_id", cohortId)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
