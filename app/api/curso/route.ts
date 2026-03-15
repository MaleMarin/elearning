/**
 * @see docs/CURSOR_RULES.md
 */
import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as firebaseProgress from "@/lib/services/firebase-progress";
import * as completion from "@/lib/services/completion";
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
  source_community?: boolean;
}

/** Lección dentro de un módulo (solo id, title, position, status para lista). */
export interface CursoModuleLessonItem {
  id: string;
  title: string;
  position: number;
  status: string;
  source_community?: boolean;
}

/** Módulo con lecciones anidadas (payload contrato Ticket 2). */
export interface CursoModuleWithLessons {
  id: string;
  title: string;
  position: number;
  status: string;
  lessonCount: number;
  lessons: CursoModuleLessonItem[];
}

export interface CursoApiResponse {
  hasEnrollment: boolean;
  cohortId: string | null;
  course: {
    id: string;
    title: string;
    description: string | null;
  } | null;
  modules: CursoModuleWithLessons[];
  lessons: CursoLesson[];
  firstLessonId: string | null;
  /** Estado de acceso por módulo: locked | available | completed */
  moduleAccess?: Record<string, completion.ModuleAccessStatus>;
  /** Razón de bloqueo por módulo (solo si status === locked) */
  moduleLockReasons?: Record<string, string>;
}

function buildModulesWithLessons(
  modules: CursoModule[],
  lessons: CursoLesson[]
): CursoModuleWithLessons[] {
  const byModule = new Map<string, CursoLesson[]>();
  for (const l of lessons) {
    const list = byModule.get(l.module_id) ?? [];
    list.push(l);
    byModule.set(l.module_id, list);
  }
  Array.from(byModule.values()).forEach((list) => list.sort((a, b) => a.order_index - b.order_index));
  return modules
    .sort((a, b) => a.order_index - b.order_index)
    .map((m) => {
      const moduleLessons = (byModule.get(m.id) ?? []).map((l) => ({
        id: l.id,
        title: l.title,
        position: l.order_index,
        status: "published" as const,
        source_community: l.source_community ?? false,
      }));
      return {
        id: m.id,
        title: m.title,
        position: m.order_index,
        status: "published",
        lessonCount: moduleLessons.length,
        lessons: moduleLessons,
      };
    });
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
  const demoModuleAccess: Record<string, completion.ModuleAccessStatus> = {};
  (DEMO_MODULES as { id: string }[]).forEach((m) => { demoModuleAccess[m.id] = "available"; });
  return {
    hasEnrollment: true,
    cohortId: demoApiData.cohortId ?? null,
    course: c ? { id: c.id, title: c.title, description: null } : null,
    modules: buildModulesWithLessons(modules, lessons),
    lessons,
    firstLessonId,
    moduleAccess: demoModuleAccess,
    moduleLockReasons: {},
  };
}

/**
 * GET /api/curso (pantalla /curso alumno)
 * - DEMO_MODE=true: datos demo.
 * - DEMO_MODE=false + Firebase: enrollment activo → cohort → curso primary → course + modules/lessons published.
 */
export async function GET(req: NextRequest): Promise<NextResponse<CursoApiResponse | { error: string }>> {
  if (getDemoMode()) {
    return NextResponse.json(demoCurso());
  }

  if (useFirebase()) {
    try {
      const auth = await getAuthFromRequest(req);
      const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
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
      const courseId = await firebaseContent.getPrimaryCourseForCohort(cohortId);
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
      const course = await unstable_cache(
        async () => firebaseContent.getPublishedCourse(courseId),
        ["course", courseId],
        { revalidate: 3600, tags: ["courses", `course-${courseId}`] }
      )();
      if (!course) {
        return NextResponse.json({
          hasEnrollment: true,
          cohortId,
          course: null,
          modules: [],
          lessons: [],
          firstLessonId: null,
        });
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
      const firstLessonId = lessons[0]?.id ?? null;
      const cursoModules: CursoModule[] = modules.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        order_index: m.order_index,
      }));
      const cursoLessons: CursoLesson[] = lessons.map((l) => ({
        id: l.id,
        title: l.title,
        summary: l.summary,
        estimated_minutes: l.estimated_minutes,
        order_index: l.order_index,
        module_id: l.module_id,
        source_community: l.source_community ?? false,
      }));
      const progress = await firebaseProgress.getProgress(auth.uid, courseId).catch(() => ({ completedLessonIds: [] }));
      const moduleAccess = await completion.getModuleAccessMap(auth.uid, courseId, moduleIds, progress.completedLessonIds);
      const moduleAccessStatus: Record<string, completion.ModuleAccessStatus> = {};
      const moduleLockReasons: Record<string, string> = {};
      for (const [k, v] of Object.entries(moduleAccess)) {
        moduleAccessStatus[k] = v.status;
        if (v.status === "locked" && v.reason) moduleLockReasons[k] = v.reason;
      }
      return NextResponse.json({
        hasEnrollment: true,
        cohortId,
        course: { id: course.id, title: course.title, description: course.description },
        modules: buildModulesWithLessons(cursoModules, cursoLessons),
        lessons: cursoLessons,
        firstLessonId,
        moduleAccess: moduleAccessStatus,
        moduleLockReasons,
      });
    } catch {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
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
    modules: buildModulesWithLessons(modules, lessons),
    lessons,
    firstLessonId,
  });
}
