import { NextResponse } from "next/server";
import { getDemoMode } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { demoApiData } from "@/lib/supabase/demo-mock";

export const dynamic = "force-dynamic";

/**
 * GET /api/courses
 * Cursos publicados asignados a la cohorte del usuario (enrollment active).
 * Solo devuelve cursos con status = 'published'.
 */
export async function GET() {
  if (getDemoMode()) return NextResponse.json({ courses: demoApiData.courses });

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("cohort_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const cohortId = enrollment?.cohort_id ?? null;
  if (!cohortId) {
    return NextResponse.json({ courses: [] });
  }

  const { data: links } = await supabase
    .from("cohort_courses")
    .select("course_id")
    .eq("cohort_id", cohortId);

  const courseIds = Array.from(new Set((links ?? []).map((l) => l.course_id)));
  if (courseIds.length === 0) {
    return NextResponse.json({ courses: [] });
  }

  const { data: courses, error } = await supabase
    .from("courses")
    .select("id, title, status, description")
    .in("id", courseIds)
    .eq("status", "published")
    .order("title");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ courses: courses ?? [] });
}
