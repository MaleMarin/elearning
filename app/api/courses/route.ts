import { NextResponse } from "next/server";
import { getDemoMode } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { demoApiData } from "@/lib/supabase/demo-mock";

export const dynamic = "force-dynamic";

/**
 * GET /api/courses
 * Cursos a los que el usuario tiene acceso (vía cohortes).
 */
export async function GET() {
  if (getDemoMode()) return NextResponse.json({ courses: demoApiData.courses });

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: memberships } = await supabase
    .from("cohort_members")
    .select("cohort_id")
    .eq("user_id", user.id);

  const cohortIds = (memberships ?? []).map((m) => m.cohort_id);
  if (cohortIds.length === 0) {
    return NextResponse.json({ courses: [] });
  }

  const { data: links } = await supabase
    .from("cohort_courses")
    .select("course_id")
    .in("cohort_id", cohortIds);

  const courseIds = Array.from(new Set((links ?? []).map((l) => l.course_id)));
  if (courseIds.length === 0) {
    return NextResponse.json({ courses: [] });
  }

  const { data: courses, error } = await supabase
    .from("courses")
    .select("id, title, status")
    .in("id", courseIds)
    .order("title");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ courses: courses ?? [] });
}
