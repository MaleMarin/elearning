import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  s += "-";
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

async function requireAdminSupabase() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado", status: 401 as const };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: "Solo administradores", status: 403 as const };
  return { user };
}

/**
 * POST /api/admin/invitations/generate
 */
export async function POST(request: NextRequest) {
  if (getDemoMode()) {
    const body = await request.json().catch(() => ({}));
    const code = "DEMO-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    return NextResponse.json({
      id: "demo-inv-id",
      code,
      cohort_id: body.cohortId ?? "demo-cohort-id",
      max_uses: body.maxUses ?? 1,
      uses: 0,
      expires_at: body.expiresAt ?? null,
      is_active: true,
      created_at: new Date().toISOString(),
    });
  }
  if (useFirebase()) {
    try {
      const auth = await getAuthFromRequest(request);
      if (auth.role !== "admin") return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
      const body = await request.json().catch(() => ({}));
      const cohortId = typeof body.cohortId === "string" ? body.cohortId.trim() : "";
      if (!cohortId) return NextResponse.json({ error: "Falta cohortId" }, { status: 400 });
      const maxUses = typeof body.maxUses === "number" && body.maxUses >= 1 ? body.maxUses : 1;
      const expiresAt = typeof body.expiresAt === "string" && body.expiresAt.trim() ? body.expiresAt.trim() : null;
      const inv = await firebaseContent.createInvitation(cohortId, auth.uid, {
        max_uses: maxUses,
        expires_at: expiresAt,
        is_active: body.isActive !== false,
      });
      return NextResponse.json({
        id: inv.id,
        code: inv.code,
        cohort_id: inv.cohort_id,
        max_uses: inv.max_uses ?? 1,
        uses: inv.uses ?? 0,
        expires_at: inv.expires_at ?? null,
        is_active: inv.is_active !== false,
        created_at: typeof inv.created_at === "string" ? inv.created_at : (inv.created_at as { toDate?: () => Date })?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
      });
    } catch {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }
  const auth = await requireAdminSupabase();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  let body: { cohortId?: string; maxUses?: number; expiresAt?: string; isActive?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }
  const cohortId = typeof body.cohortId === "string" ? body.cohortId.trim() : "";
  if (!cohortId) return NextResponse.json({ error: "Falta cohortId" }, { status: 400 });
  const isActive = body.isActive !== false;
  const admin = createAdminClient();
  let code = generateCode();
  for (let attempt = 0; attempt < 10; attempt++) {
    const { data: existing } = await admin.from("invitations").select("id").eq("code", code).maybeSingle();
    if (!existing) break;
    code = generateCode();
  }
  const maxUses = typeof body.maxUses === "number" && body.maxUses >= 1 ? body.maxUses : 1;
  const expiresAt = typeof body.expiresAt === "string" && body.expiresAt.trim() ? body.expiresAt.trim() : null;
  const { data, error } = await admin
    .from("invitations")
    .insert({
      code,
      cohort_id: cohortId,
      max_uses: maxUses,
      uses: 0,
      expires_at: expiresAt,
      is_active: isActive,
      created_by: auth.user.id,
    })
    .select("id, code, cohort_id, max_uses, uses, expires_at, is_active, created_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
