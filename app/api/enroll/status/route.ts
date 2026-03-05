import { NextResponse } from "next/server";
import { getDemoMode } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/enroll/status
 * Devuelve { enrolled: boolean, cohortId?: string } para el usuario autenticado.
 * enrolled = admin O tiene al menos un enrollment con status 'active'.
 * cohortId = id de la cohorte más reciente (created_at desc) si hay enrollment activo.
 */
export async function GET() {
  if (getDemoMode()) {
    return NextResponse.json({ enrolled: true, cohortId: "demo-cohort-id" });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ enrolled: false }, { status: 200 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    return NextResponse.json({ enrolled: true });
  }

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, cohort_id, created_at")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1);

  if (enrollments && enrollments.length > 0) {
    const latest = enrollments[0];
    return NextResponse.json({
      enrolled: true,
      cohortId: latest.cohort_id ?? undefined,
    });
  }

  return NextResponse.json({ enrolled: false }, { status: 200 });
}
