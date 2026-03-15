/**
 * @see docs/CURSOR_RULES.md — Ticket 2: ruta curso + navegación prev/next.
 */
import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as h5pService from "@/lib/services/h5p";
import type { H5PContentPayload } from "@/lib/services/h5p";
import { getBlocksForRender, type LessonBlock } from "@/lib/services/lessonBlocks";
import { DEMO_LESSONS, DEMO_MODULES, DEMO_COURSE_ID } from "@/lib/supabase/demo-mock";

export const dynamic = "force-dynamic";

export interface CursoLessonDetail {
  id: string;
  title: string;
  summary: string;
  content: string | null;
  video_embed_url: string | null;
  estimated_minutes: number | null;
  module_id: string;
  moduleId: string;
  order_index: number;
  position: number;
  /** ID de contenido H5P asociado (Firestore h5p_content). */
  h5pContentId?: string | null;
  /** Contenido H5P embebido para evitar request extra. */
  h5pContent?: H5PContentPayload | null;
  /** Bloques Notion-style. Si existe y length > 0 se usa en lugar de content. */
  blocks?: LessonBlock[];
  /** Lección creada desde propuesta UGC (badge Comunidad). */
  source_community?: boolean;
}

export interface CursoLeccionModuleContext {
  id: string;
  title: string;
  index: number;
  totalModules: number;
}

export interface CursoLeccionApiResponse {
  lesson: CursoLessonDetail | null;
  courseId: string | null;
  module: CursoLeccionModuleContext | null;
  prevLessonId: string | null;
  nextLessonId: string | null;
  /** Total de lecciones del curso (para barra de progreso y visibilidad de estado). */
  totalLessons: number;
  /** Índice 1-based de esta lección en la ruta lineal del curso. */
  lessonIndex: number;
  notFound: boolean;
}

/**
 * GET /api/curso/lecciones/[lessonId]
 * Lección publicada que pertenece al curso primario de la cohorte del usuario.
 * Devuelve lesson + prev/next para navegación.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
): Promise<NextResponse<CursoLeccionApiResponse | { error: string }>> {
  const { lessonId } = await params;
  if (!lessonId) {
    return NextResponse.json(
      { lesson: null, courseId: null, module: null, prevLessonId: null, nextLessonId: null, totalLessons: 0, lessonIndex: 0, notFound: true },
      { status: 404 }
    );
  }

  if (getDemoMode()) {
    const lesson = DEMO_LESSONS.find((l) => l.id === lessonId);
    if (!lesson) {
      return NextResponse.json(
        { lesson: null, courseId: null, module: null, prevLessonId: null, nextLessonId: null, totalLessons: 0, lessonIndex: 0, notFound: true },
        { status: 404 }
      );
    }
    const sortedModules = [...DEMO_MODULES].sort((a, b) => a.order_index - b.order_index);
    const moduleIndex = sortedModules.findIndex((m) => m.id === lesson.module_id);
    const mod = moduleIndex >= 0 ? sortedModules[moduleIndex] : null;
    const idx = DEMO_LESSONS.findIndex((l) => l.id === lessonId);
    const prevLessonId = idx > 0 ? DEMO_LESSONS[idx - 1].id : null;
    const nextLessonId = idx >= 0 && idx < DEMO_LESSONS.length - 1 ? DEMO_LESSONS[idx + 1].id : null;
    const totalLessons = DEMO_LESSONS.length;
    const lessonIndex = idx >= 0 ? idx + 1 : 0;
    const demoH5P: H5PContentPayload | null = lessonId === "demo-l2"
      ? {
          type: "flashcards",
          cards: [
            { front: "¿Qué es la innovación pública?", back: "Cambio que genera valor para la ciudadanía desde el sector público." },
            { front: "¿Qué significa 'fallar rápido'?", back: "Aprender de pruebas tempranas y ajustar el rumbo." },
          ],
        }
      : null;
    const demoLesson = lesson as { content?: string; blocks?: LessonBlock[] };
    const blocks = getBlocksForRender({
      content: demoLesson.content ?? null,
      blocks: demoLesson.blocks,
    });
    return NextResponse.json({
      lesson: {
        id: lesson.id,
        title: lesson.title,
        summary: (lesson as { summary?: string }).summary ?? "",
        content: demoLesson.content ?? null,
        video_embed_url: null,
        estimated_minutes: null,
        module_id: lesson.module_id,
        moduleId: lesson.module_id,
        order_index: lesson.order_index,
        position: lesson.order_index,
        h5pContentId: demoH5P ? "demo-h5p" : null,
        h5pContent: demoH5P,
        blocks: blocks.length > 0 ? blocks : undefined,
      },
      courseId: DEMO_COURSE_ID,
      module: mod
        ? { id: mod.id, title: mod.title, index: moduleIndex + 1, totalModules: sortedModules.length }
        : null,
      prevLessonId,
      nextLessonId,
      totalLessons,
      lessonIndex,
      notFound: false,
    });
  }

  if (useFirebase()) {
    try {
      const auth = await getAuthFromRequest(request);
      const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
      const cohortId = enrollment?.cohort_id ?? null;
      if (!cohortId) {
        return NextResponse.json(
          { lesson: null, courseId: null, module: null, prevLessonId: null, nextLessonId: null, totalLessons: 0, lessonIndex: 0, notFound: true },
          { status: 404 }
        );
      }
      const courseId = await firebaseContent.getPrimaryCourseForCohort(cohortId);
      if (!courseId) {
        return NextResponse.json(
          { lesson: null, courseId: null, module: null, prevLessonId: null, nextLessonId: null, totalLessons: 0, lessonIndex: 0, notFound: true },
          { status: 404 }
        );
      }
      const lessonRaw = await unstable_cache(
        async () => firebaseContent.getLesson(lessonId).catch(() => null),
        ["lesson", lessonId],
        { revalidate: 3600, tags: ["lessons", `lesson-${lessonId}`] }
      )();
      if (!lessonRaw || (lessonRaw.status as string) !== "published") {
        return NextResponse.json(
          { lesson: null, courseId: null, module: null, prevLessonId: null, nextLessonId: null, totalLessons: 0, lessonIndex: 0, notFound: true },
          { status: 404 }
        );
      }
      const moduleId = lessonRaw.module_id as string;
      const modDoc = await unstable_cache(
        async () => firebaseContent.getModule(moduleId).catch(() => null),
        ["module", moduleId],
        { revalidate: 3600, tags: ["courses", `course-${courseId}`] }
      )();
      if (!modDoc || (modDoc.course_id as string) !== courseId || (modDoc.status as string) !== "published") {
        return NextResponse.json(
          { lesson: null, courseId: null, module: null, prevLessonId: null, nextLessonId: null, totalLessons: 0, lessonIndex: 0, notFound: true },
          { status: 404 }
        );
      }
      const modules = await unstable_cache(
        async () => firebaseContent.getPublishedModules(courseId),
        ["modules", courseId],
        { revalidate: 3600, tags: ["courses", `course-${courseId}`] }
      )();
      const moduleIds = modules.map((m) => m.id);
      const lessons = await unstable_cache(
        async () => firebaseContent.getPublishedLessons(moduleIds),
        ["lessons", courseId, moduleIds.join(",")],
        { revalidate: 3600, tags: ["lessons", `course-${courseId}`] }
      )();
      const modIndex = modules.findIndex((m) => m.id === moduleId);
      const prevLessonId = (() => {
        const i = lessons.findIndex((l) => l.id === lessonId);
        return i > 0 ? lessons[i - 1].id : null;
      })();
      const nextLessonId = (() => {
        const i = lessons.findIndex((l) => l.id === lessonId);
        return i >= 0 && i < lessons.length - 1 ? lessons[i + 1].id : null;
      })();
      const h5pContentId = (lessonRaw.h5p_content_id as string) ?? null;
    let h5pContent: H5PContentPayload | null = null;
    if (h5pContentId) {
      const h5pDoc = await h5pService.getH5PContent(h5pContentId).catch(() => null);
      if (h5pDoc) h5pContent = h5pDoc.content;
    }
    const blocks = getBlocksForRender({
      content: (lessonRaw.content as string) ?? null,
      blocks: lessonRaw.blocks as LessonBlock[] | undefined,
    });
    const lessonDetail: CursoLessonDetail = {
        id: lessonRaw.id as string,
        title: lessonRaw.title as string,
        summary: (lessonRaw.summary as string) ?? "",
        content: (lessonRaw.content as string) ?? null,
        video_embed_url: (lessonRaw.video_embed_url as string) ?? null,
        estimated_minutes: (lessonRaw.estimated_minutes as number) ?? null,
        module_id: moduleId,
        moduleId,
        order_index: (lessonRaw.order_index as number) ?? 0,
        position: (lessonRaw.order_index as number) ?? 0,
        h5pContentId: h5pContentId ?? undefined,
        h5pContent: h5pContent ?? undefined,
        blocks: blocks.length > 0 ? blocks : undefined,
        source_community: (lessonRaw.source_community as boolean) ?? false,
      };
      const lessonIndex = lessons.findIndex((l) => l.id === lessonId) + 1;
      return NextResponse.json({
        lesson: lessonDetail,
        courseId,
        module: {
          id: modDoc.id as string,
          title: modDoc.title as string,
          index: modIndex + 1,
          totalModules: modules.length,
        },
        prevLessonId,
        nextLessonId,
        totalLessons: lessons.length,
        lessonIndex: lessonIndex || 0,
        notFound: false,
      });
    } catch {
      return NextResponse.json(
        { lesson: null, courseId: null, module: null, prevLessonId: null, nextLessonId: null, totalLessons: 0, lessonIndex: 0, notFound: true },
        { status: 404 }
      );
    }
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const emptyLessonResponse = {
    lesson: null as CursoLessonDetail | null,
    courseId: null as string | null,
    module: null as CursoLeccionModuleContext | null,
    prevLessonId: null as string | null,
    nextLessonId: null as string | null,
    totalLessons: 0,
    lessonIndex: 0,
    notFound: true as const,
  };

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
    return NextResponse.json(emptyLessonResponse, { status: 404 });
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
    return NextResponse.json(emptyLessonResponse, { status: 404 });
  }

  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("id, title, summary, content, video_embed_url, estimated_minutes, module_id, order_index, source_community")
    .eq("id", lessonId)
    .eq("status", "published")
    .single();

  if (lessonError || !lesson) {
    return NextResponse.json(emptyLessonResponse, { status: 404 });
  }

  const { data: mod } = await supabase
    .from("modules")
    .select("course_id")
    .eq("id", lesson.module_id)
    .single();

  if (!mod || mod.course_id !== courseId) {
    return NextResponse.json(emptyLessonResponse, { status: 404 });
  }

  const { data: mods } = await supabase
    .from("modules")
    .select("id, title, order_index")
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
  const sortedMods = (mods ?? []).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  const moduleIndex = sortedMods.findIndex((m) => m.id === lesson.module_id);
  const moduleContext = moduleIndex >= 0 && sortedMods[moduleIndex]
    ? {
        id: sortedMods[moduleIndex].id,
        title: (sortedMods[moduleIndex] as { title?: string }).title ?? "",
        index: moduleIndex + 1,
        totalModules: sortedMods.length,
      }
    : null;

  const lessonIndex = idx >= 0 ? idx + 1 : 0;
  return NextResponse.json({
    lesson: {
      id: lesson.id,
      title: lesson.title,
      summary: lesson.summary ?? "",
      content: lesson.content ?? null,
      video_embed_url: lesson.video_embed_url ?? null,
      estimated_minutes: lesson.estimated_minutes ?? null,
      module_id: lesson.module_id,
      moduleId: lesson.module_id,
      order_index: lesson.order_index ?? 0,
      position: lesson.order_index ?? 0,
      source_community: (lesson as { source_community?: boolean }).source_community ?? false,
    },
    courseId,
    module: moduleContext,
    prevLessonId,
    nextLessonId,
    totalLessons: ordered.length,
    lessonIndex,
    notFound: false,
  });
}
