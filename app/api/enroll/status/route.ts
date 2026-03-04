import { NextResponse } from "next/server";
import { getDemoMode } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/enroll/status
 * Devuelve si el usuario tiene acceso a la plataforma (enrollment activo).
 * "Enrolled" = es admin O tiene al menos una fila en cohort_members.
 * Usado por middleware y por /no-inscrito.
 */
export async function GET() {
  if (getDemoMode()) return NextResponse.json({ enrolled: true });

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
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

  const { count, error } = await supabase
    .from("cohort_members")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ enrolled: (count ?? 0) > 0 });
}
