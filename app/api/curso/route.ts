import { NextResponse } from "next/server";
import { getDemoMode } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { demoApiData, DEMO_MODULES, DEMO_LESSONS } from "@/lib/supabase/demo-mock";

export const dynamic = "force-dynamic";

export interface CursoModule {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
}

export interface CursoLesson {
  id: string;
  title: string;
  summary: string;
  estimated_minutes: number | null;
  order_index: number;
  module_id: string;
}

export interface CursoApiResponse {
  hasEnrollment: boolean;
  cohortId: string | null;
  course: {
    id: string;
    title: string;
    description: string | null;
  } | null;
  modules: CursoModule[];
  lessons: CursoLesson[];
  firstLessonId: string | null;
}

function demoCurso(): CursoApiResponse {
  const courses = demoApiData.courses as { id: string; title: string }[];
  const c = courses[0];
  const modules = DEMO_MODULES.map((m) => ({
    id: m.id,
    title: m.title,
    description: null as string | null,
    order_index: m.order_index,
  }));
  const lessons = DEMO_LESSONS.map((l) => ({
    id: l.id,
    title: l.title,
    summary: (l as { summary?: string }).summary ?? "",
    estimated_minutes: null as number | null,
    order_index: l.order_index,
    module_id: l.module_id,
  }));
  const firstLessonId = DEMO_LESSONS[0]?.id ?? null;
  return {
    hasEnrollment: true,
    cohortId: demoApiData.cohortId ?? null,
    course: c ? { id: c.id, title: c.title, description: null } : null,
    modules,
    lessons,
    firstLessonId,
  };
}

/**
 * GET /api/curso (pantalla /curso alumno)
 * - DEMO_MODE=true: devuelve datos demo (DEMO_MODULES, DEMO_LESSONS).
 * - DEMO_MODE=false: cohorte activa desde enrollments (status='active'), curso desde cohort_courses
 *   (is_primary=true o primer enlace), solo course published y solo modules/lessons published.
 */
export async function GET(): Promise<NextResponse<CursoApiResponse | { error: string }>> {
  if (getDemoMode()) {
    return NextResponse.json(demoCurso());
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

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
    return NextResponse.json({
      hasEnrollment: false,
      cohortId: null,
      course: null,
      modules: [],
      lessons: [],
      firstLessonId: null,
    });
  }

  let { data: primaryLink } = await supabase
    .from("cohort_courses")
    .select("course_id")
    .eq("cohort_id", cohortId)
    .eq("is_primary", true)
    .limit(1)
    .maybeSingle();

  if (!primaryLink?.course_id) {
    const { data: first } = await supabase
      .from("cohort_courses")
      .select("course_id")
      .eq("cohort_id", cohortId)
      .limit(1)
      .maybeSingle();
    primaryLink = first;
  }

  const courseId = primaryLink?.course_id ?? null;
  if (!courseId) {
    return NextResponse.json({
      hasEnrollment: true,
      cohortId,
      course: null,
      modules: [],
      lessons: [],
      firstLessonId: null,
    });
  }

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, title, description")
    .eq("id", courseId)
    .eq("status", "published")
    .single();

  if (courseError || !course) {
    return NextResponse.json({
      hasEnrollment: true,
      cohortId,
      course: null,
      modules: [],
      lessons: [],
      firstLessonId: null,
    });
  }

  const { data: mods } = await supabase
    .from("modules")
    .select("id, title, description, order_index")
    .eq("course_id", courseId)
    .eq("status", "published")
    .order("order_index", { ascending: true });

  const modules = (mods ?? []) as CursoModule[];
  const moduleIds = modules.map((m) => m.id);

  let lessons: CursoLesson[] = [];
  let firstLessonId: string | null = null;

  if (moduleIds.length > 0) {
    const { data: less } = await supabase
      .from("lessons")
      .select("id, title, summary, estimated_minutes, order_index, module_id")
      .in("module_id", moduleIds)
      .eq("status", "published")
      .order("order_index", { ascending: true });
    lessons = (less ?? []) as CursoLesson[];
    const ordered = [...lessons].sort((a, b) => {
      const ai = modules.findIndex((m) => m.id === a.module_id);
      const bi = modules.findIndex((m) => m.id === b.module_id);
      if (ai !== bi) return ai - bi;
      return a.order_index - b.order_index;
    });
    firstLessonId = ordered[0]?.id ?? null;
  }

  return NextResponse.json({
    hasEnrollment: true,
    cohortId,
    course: {
      id: course.id,
      title: course.title,
      description: course.description ?? null,
    },
    modules,
    lessons,
    firstLessonId,
  });
}
