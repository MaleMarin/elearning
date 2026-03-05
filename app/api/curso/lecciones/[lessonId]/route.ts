import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getDemoMode } from "@/lib/env";
import { DEMO_LESSONS, DEMO_COURSE_ID } from "@/lib/supabase/demo-mock";

export const dynamic = "force-dynamic";

export interface CursoLessonDetail {
  id: string;
  title: string;
  summary: string;
  content: string | null;
  video_embed_url: string | null;
  estimated_minutes: number | null;
  module_id: string;
  order_index: number;
}

export interface CursoLeccionApiResponse {
  lesson: CursoLessonDetail | null;
  courseId: string | null;
  prevLessonId: string | null;
  nextLessonId: string | null;
  notFound: boolean;
}

/**
 * GET /api/curso/lecciones/[lessonId]
 * Lección publicada que pertenece al curso primario de la cohorte del usuario.
 * Devuelve lesson + prev/next para navegación.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
): Promise<NextResponse<CursoLeccionApiResponse | { error: string }>> {
  const { lessonId } = await params;
  if (!lessonId) {
    return NextResponse.json({ lesson: null, courseId: null, prevLessonId: null, nextLessonId: null, notFound: true });
  }

  if (getDemoMode()) {
    const lesson = DEMO_LESSONS.find((l) => l.id === lessonId);
    if (!lesson) {
      return NextResponse.json({
        lesson: null,
        courseId: null,
        prevLessonId: null,
        nextLessonId: null,
        notFound: true,
      });
    }
    const idx = DEMO_LESSONS.findIndex((l) => l.id === lessonId);
    const prevLessonId = idx > 0 ? DEMO_LESSONS[idx - 1].id : null;
    const nextLessonId = idx >= 0 && idx < DEMO_LESSONS.length - 1 ? DEMO_LESSONS[idx + 1].id : null;
    return NextResponse.json({
      lesson: {
        id: lesson.id,
        title: lesson.title,
        summary: (lesson as { summary?: string }).summary ?? "",
        content: (lesson as { content?: string }).content ?? null,
        video_embed_url: null,
        estimated_minutes: null,
        module_id: lesson.module_id,
        order_index: lesson.order_index,
      },
      courseId: DEMO_COURSE_ID,
      prevLessonId,
      nextLessonId,
      notFound: false,
    });
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
      lesson: null,
      courseId: null,
      prevLessonId: null,
      nextLessonId: null,
      notFound: true,
    });
  }

  const { data: primaryLink } = await supabase
    .from("cohort_courses")
    .select("course_id")
    .eq("cohort_id", cohortId)
    .eq("is_primary", true)
    .limit(1)
    .maybeSingle();

  let courseId = primaryLink?.course_id ?? null;
  if (!courseId) {
    const { data: first } = await supabase
      .from("cohort_courses")
      .select("course_id")
      .eq("cohort_id", cohortId)
      .limit(1)
      .maybeSingle();
    courseId = first?.course_id ?? null;
  }

  if (!courseId) {
    return NextResponse.json({
      lesson: null,
      courseId: null,
      prevLessonId: null,
      nextLessonId: null,
      notFound: true,
    });
  }

  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("id, title, summary, content, video_embed_url, estimated_minutes, module_id, order_index")
    .eq("id", lessonId)
    .eq("status", "published")
    .single();

  if (lessonError || !lesson) {
    return NextResponse.json({
      lesson: null,
      courseId,
      prevLessonId: null,
      nextLessonId: null,
      notFound: true,
    });
  }

  const { data: mod } = await supabase
    .from("modules")
    .select("course_id")
    .eq("id", lesson.module_id)
    .single();

  if (!mod || mod.course_id !== courseId) {
    return NextResponse.json({
      lesson: null,
      courseId,
      prevLessonId: null,
      nextLessonId: null,
      notFound: true,
    });
  }

  const { data: mods } = await supabase
    .from("modules")
    .select("id, order_index")
    .eq("course_id", courseId)
    .eq("status", "published")
    .order("order_index", { ascending: true });

  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id, module_id, order_index")
    .in("module_id", (mods ?? []).map((m) => m.id))
    .eq("status", "published")
    .order("order_index", { ascending: true });

  const ordered = (allLessons ?? []).sort((a, b) => {
    const ma = mods?.findIndex((m) => m.id === a.module_id) ?? 0;
    const mb = mods?.findIndex((m) => m.id === b.module_id) ?? 0;
    if (ma !== mb) return ma - mb;
    return (a.order_index ?? 0) - (b.order_index ?? 0);
  });

  const idx = ordered.findIndex((l) => l.id === lessonId);
  const prevLessonId = idx > 0 ? ordered[idx - 1].id : null;
  const nextLessonId = idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1].id : null;

  return NextResponse.json({
    lesson: {
      id: lesson.id,
      title: lesson.title,
      summary: lesson.summary ?? "",
      content: lesson.content ?? null,
      video_embed_url: lesson.video_embed_url ?? null,
      estimated_minutes: lesson.estimated_minutes ?? null,
      module_id: lesson.module_id,
      order_index: lesson.order_index ?? 0,
    },
    courseId,
    prevLessonId,
    nextLessonId,
    notFound: false,
  });
}
