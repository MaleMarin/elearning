import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ensureContentEditor } from "@/lib/services/content";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/cohort-courses?cohortId=...
 * Lista cursos asignados a una cohorte (solo admin/mentor).
 */
export async function GET(req: NextRequest) {
  try {
    await ensureContentEditor();
    const { searchParams } = new URL(req.url);
    const cohortId = searchParams.get("cohortId");
    if (!cohortId) {
      return NextResponse.json({ error: "Falta cohortId" }, { status: 400 });
    }
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("cohort_courses")
      .select("id, cohort_id, course_id, is_primary")
      .eq("cohort_id", cohortId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const courseIds = (data ?? []).map((r) => r.course_id);
    let courses: { id: string; title: string; status: string }[] = [];
    if (courseIds.length > 0) {
      const { data: rows } = await supabase
        .from("courses")
        .select("id, title, status")
        .in("id", courseIds);
      courses = rows ?? [];
    }
    return NextResponse.json({
      cohortCourses: data ?? [],
      courses,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "No autorizado" ? 401 : msg === "Solo admin o mentor" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
