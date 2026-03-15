import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as firebaseProgress from "@/lib/services/firebase-progress";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { demoApiData } from "@/lib/supabase/demo-mock";
import { DEMO_MODULES, DEMO_NEXT_LESSON, DEMO_COURSE_ID } from "@/lib/supabase/demo-mock";

export const dynamic = "force-dynamic";

export interface DashboardSession {
  id: string;
  title: string;
  scheduled_at: string;
  meeting_url: string | null;
}

export interface DashboardTask {
  id: string;
  title: string;
  due_at: string;
  completed_at: string | null;
}

export interface DashboardPost {
  id: string;
  title: string;
  body: string;
  created_at: string;
  author_name: string | null;
}

export interface DashboardModule {
  id: string;
  title: string;
  order_index: number;
  course_id?: string;
}

export interface DashboardResponse {
  cohortId: string | null;
  courseId: string | null;
  userName: string;
  nextSession: DashboardSession | null;
  nextTask: DashboardTask | null;
  lastPost: DashboardPost | null;
  progress: { lessonsDone: number; lessonsTotal: number };
  modules: DashboardModule[];
  showDemoModules: boolean;
  nextLessonHref: string | null;
  nextLessonTitle: string | null;
  nextLessonSummary: string | null;
}

function demoDashboard(userName: string): DashboardResponse {
  const session = demoApiData.sessions[0] ?? null;
  const task = demoApiData.tasks[0] ?? null;
  const post = demoApiData.posts[0]
    ? {
        id: demoApiData.posts[0].id,
        title: demoApiData.posts[0].title,
        body: (demoApiData.posts[0] as { body?: string }).body ?? "",
        created_at: demoApiData.posts[0].created_at,
        author_name: "Comunidad",
      }
    : null;
  return {
    cohortId: demoApiData.cohortId,
    courseId: DEMO_COURSE_ID,
    userName,
    nextSession: session
      ? {
          id: session.id,
          title: session.title,
          scheduled_at: session.scheduled_at,
          meeting_url: session.meeting_url ?? null,
        }
      : null,
    nextTask: task
      ? {
          id: task.id,
          title: task.title,
          due_at: task.due_at,
          completed_at: task.completed_at ?? null,
        }
      : null,
    lastPost: post,
    progress: { lessonsDone: 1, lessonsTotal: 2 },
    modules: DEMO_MODULES,
    showDemoModules: true,
    nextLessonHref: "/curso",
    nextLessonTitle: DEMO_NEXT_LESSON.title,
    nextLessonSummary: DEMO_NEXT_LESSON.summary,
  };
}

export async function GET(req: NextRequest): Promise<NextResponse<DashboardResponse | { error: string }>> {
  if (getDemoMode()) {
    return NextResponse.json(demoDashboard("Estudiante"));
  }

  if (useFirebase()) {
    try {
      const auth = await getAuthFromRequest(req);
      const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
      const cohortId = enrollment?.cohort_id ?? null;
      const courseId = await firebaseContent.getPrimaryCourseForCohort(cohortId ?? "");
      if (!cohortId || !courseId) {
        return NextResponse.json({
          cohortId,
          courseId: courseId ?? null,
          userName: auth.email?.split("@")[0] ?? "Estudiante",
          nextSession: null,
          nextTask: null,
          lastPost: null,
          progress: { lessonsDone: 0, lessonsTotal: 0 },
          modules: [],
          showDemoModules: false,
          nextLessonHref: null,
          nextLessonTitle: null,
          nextLessonSummary: null,
        });
      }
      const modules = await firebaseContent.getPublishedModules(courseId);
      const moduleIds = modules.map((m) => m.id);
      const lessons = await firebaseContent.getPublishedLessons(moduleIds);
      const lessonsTotal = lessons.length;
      const { completedLessonIds } = await firebaseProgress.getProgress(auth.uid, courseId);
      const publishedIds = new Set(lessons.map((l) => l.id));
      const lessonsDone = completedLessonIds.filter((id) => publishedIds.has(id)).length;
      const firstLesson = lessons[0];
      return NextResponse.json({
        cohortId,
        courseId,
        userName: auth.email?.split("@")[0] ?? "Estudiante",
        nextSession: null,
        nextTask: null,
        lastPost: null,
        progress: { lessonsDone, lessonsTotal },
        modules: modules.map((m) => ({ id: m.id, title: m.title, order_index: m.order_index, course_id: courseId })),
        showDemoModules: false,
        nextLessonHref: firstLesson ? `/curso/lecciones/${firstLesson.id}` : "/curso",
        nextLessonTitle: firstLesson?.title ?? null,
        nextLessonSummary: firstLesson?.summary ?? null,
      });
    } catch {
      return NextResponse.json({ error: "No autorizado" } as { error: string }, { status: 401 });
    }
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" } as { error: string }, { status: 401 });
  }

  const profile = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();
  const userName =
    (profile.data?.full_name as string)?.trim() ||
    user.email?.split("@")[0] ||
    "Estudiante";

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
      cohortId: null,
      courseId: null,
      userName,
      nextSession: null,
      nextTask: null,
      lastPost: null,
      progress: { lessonsDone: 0, lessonsTotal: 0 },
      modules: [],
      showDemoModules: false,
      nextLessonHref: null,
      nextLessonTitle: null,
      nextLessonSummary: null,
    });
  }

  const now = new Date().toISOString();

  const [sessionRes, taskRes, postRes, cohortCoursesRes] = await Promise.all([
    supabase
      .from("sessions")
      .select("id, title, scheduled_at, meeting_url")
      .eq("cohort_id", cohortId)
      .gte("scheduled_at", now)
      .order("scheduled_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("tasks")
      .select("id, title, due_at, completed_at")
      .eq("user_id", user.id)
      .or(`cohort_id.eq.${cohortId},cohort_id.is.null`)
      .is("completed_at", null)
      .gte("due_at", now)
      .order("due_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("community_posts")
      .select("id, title, body, created_at, user_id")
      .eq("cohort_id", cohortId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("cohort_courses")
      .select("course_id, is_primary")
      .eq("cohort_id", cohortId),
  ]);

  const cohortCourses = cohortCoursesRes.data ?? [];
  const primaryLink = cohortCourses.find((r: { is_primary?: boolean }) => r.is_primary === true);
  const courseIds = primaryLink
    ? [primaryLink.course_id]
    : cohortCourses.length > 0
      ? cohortCourses.map((r: { course_id: string }) => r.course_id)
      : [];

  let lastPost: DashboardPost | null = null;
  if (postRes.data) {
    const p = postRes.data;
    const author =
      p.user_id &&
      (await supabase.from("profiles").select("full_name").eq("id", p.user_id).single()).data
        ?.full_name;
    lastPost = {
      id: p.id,
      title: p.title,
      body: p.body,
      created_at: p.created_at,
      author_name: (author as string) ?? null,
    };
  }

  let lessonsTotal = 0;
  let modules: DashboardModule[] = [];
  if (courseIds.length > 0) {
    const { data: mods } = await supabase
      .from("modules")
      .select("id, title, order_index, course_id")
      .in("course_id", courseIds)
      .eq("status", "published")
      .order("order_index", { ascending: true });
    modules = (mods ?? []).map((m) => ({
      id: m.id,
      title: m.title,
      order_index: m.order_index,
      course_id: m.course_id,
    }));
    const moduleIds = (mods ?? []).map((m) => m.id);
    if (moduleIds.length > 0) {
      const { count } = await supabase
        .from("lessons")
        .select("id", { count: "exact", head: true })
        .in("module_id", moduleIds)
        .eq("status", "published");
      lessonsTotal = count ?? 0;
    }
  }

  const nextSession: DashboardSession | null = sessionRes.data
    ? {
        id: sessionRes.data.id,
        title: sessionRes.data.title,
        scheduled_at: sessionRes.data.scheduled_at,
        meeting_url: sessionRes.data.meeting_url ?? null,
      }
    : null;

  const nextTask: DashboardTask | null = taskRes.data
    ? {
        id: taskRes.data.id,
        title: taskRes.data.title,
        due_at: taskRes.data.due_at,
        completed_at: taskRes.data.completed_at ?? null,
      }
    : null;

  const firstCourseId = courseIds[0] ?? null;
  let nextLessonHref: string | null = null;
  let nextLessonTitle: string | null = null;
  let nextLessonSummary: string | null = null;
  if (firstCourseId && modules.length > 0) {
    const firstMod = modules[0];
    const { data: firstLesson } = await supabase
      .from("lessons")
      .select("id, title, summary")
      .eq("module_id", firstMod.id)
      .eq("status", "published")
      .order("order_index", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (firstLesson) {
      nextLessonHref = `/curso/lecciones/${firstLesson.id}`;
      nextLessonTitle = firstLesson.title;
      nextLessonSummary = firstLesson.summary ?? "";
    } else {
      nextLessonHref = "/curso";
    }
  }

  const courseId = firstCourseId;
  return NextResponse.json({
    cohortId,
    courseId,
    userName,
    nextSession,
    nextTask,
    lastPost,
    progress: { lessonsDone: 0, lessonsTotal },
    modules,
    showDemoModules: false,
    nextLessonHref,
    nextLessonTitle,
    nextLessonSummary,
  });
}
