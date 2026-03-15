import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ensureContentEditor } from "@/lib/services/content";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/cohort-courses?cohortId=...
 */
export async function GET(req: NextRequest) {
  if (getDemoMode()) return NextResponse.json({ cohortCourses: [], courses: [] });
  if (useFirebase()) {
    try {
      await getAuthFromRequest(req);
      const { searchParams } = new URL(req.url);
      const cohortId = searchParams.get("cohortId");
      if (!cohortId) return NextResponse.json({ error: "Falta cohortId" }, { status: 400 });
      const { cohortCourses, courses } = await firebaseContent.getCohortCoursesByCohort(cohortId);
      return NextResponse.json({
        cohortCourses,
        courses: courses.map((c) => ({ id: c.id, title: c.title, status: c.status })),
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      return NextResponse.json({ error: msg }, { status: msg === "No autorizado" ? 401 : 500 });
    }
  }
  try {
    await ensureContentEditor();
    const { searchParams } = new URL(req.url);
    const cohortId = searchParams.get("cohortId");
    if (!cohortId) return NextResponse.json({ error: "Falta cohortId" }, { status: 400 });
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("cohort_courses")
      .select("id, cohort_id, course_id, is_primary")
      .eq("cohort_id", cohortId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const courseIds = (data ?? []).map((r) => r.course_id);
    let courses: { id: string; title: string; status: string }[] = [];
    if (courseIds.length > 0) {
      const { data: rows } = await supabase.from("courses").select("id, title, status").in("id", courseIds);
      courses = rows ?? [];
    }
    return NextResponse.json({ cohortCourses: data ?? [], courses });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "No autorizado" ? 401 : msg === "Solo admin o mentor" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
