import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ensureContentEditor, getCohortCourses, assignCourseToCohort, unassignCourseFromCohort } from "@/lib/services/content";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureContentEditor();
    const { id: courseId } = await params;
    const links = await getCohortCourses(courseId);
    const cohortIds = Array.from(new Set(links.map((l) => l.cohort_id)));
    let names: Record<string, string> = {};
    if (cohortIds.length > 0) {
      const supabase = await createServerSupabaseClient();
      const { data } = await supabase.from("cohorts").select("id, name").in("id", cohortIds);
      names = Object.fromEntries((data ?? []).map((c) => [c.id, c.name]));
    }
    const cohortCourses = links.map((l) => ({ ...l, cohort_name: names[l.cohort_id] ?? l.cohort_id }));
    return NextResponse.json({ cohortCourses });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "No autorizado" ? 401 : msg === "Solo admin o mentor" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureContentEditor();
    const { id: courseId } = await params;
    const body = await req.json();
    const cohortId = body.cohortId as string;
    if (!cohortId) return NextResponse.json({ error: "Falta cohortId" }, { status: 400 });
    const link = await assignCourseToCohort(courseId, cohortId);
    return NextResponse.json({ link });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "No autorizado" ? 401 : msg === "Solo admin o mentor" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureContentEditor();
    const { id: courseId } = await params;
    const { searchParams } = new URL(req.url);
    const cohortId = searchParams.get("cohortId");
    if (!cohortId) return NextResponse.json({ error: "Falta cohortId" }, { status: 400 });
    await unassignCourseFromCohort(cohortId, courseId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "No autorizado" ? 401 : msg === "Solo admin o mentor" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
