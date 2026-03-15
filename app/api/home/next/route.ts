import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { PRECISAR_SESSION_COOKIE, isDemoCookieValue } from "@/lib/auth/session-cookie";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DEMO_LESSONS, DEMO_USER_DISPLAY_NAME } from "@/lib/supabase/demo-mock";
import { demoApiData } from "@/lib/supabase/demo-mock";

export const dynamic = "force-dynamic";

export interface HomeNextResponse {
  cohortId: string | null;
  courseId: string | null;
  firstLessonId: string | null;
  courseTitle: string | null;
  nextLessonTitle: string | null;
  nextLessonSummary: string | null;
  nextLabel: string;
  userName: string;
}

function demoNext(): HomeNextResponse {
  const firstLesson = DEMO_LESSONS[0] as { id: string; title: string; summary?: string };
  const course = (demoApiData.courses as { id: string; title: string }[])[0];
  return {
    cohortId: demoApiData.cohortId ?? null,
    courseId: course?.id ?? null,
    firstLessonId: firstLesson?.id ?? null,
    courseTitle: course?.title ?? null,
    nextLessonTitle: firstLesson?.title ?? null,
    nextLessonSummary: firstLesson?.summary ?? null,
    nextLabel: "Continuar",
    userName: DEMO_USER_DISPLAY_NAME,
  };
}

/**
 * GET /api/home/next
 * Next best action para /inicio: grupo activo → curso primary → primera lección publicada.
 * Usa Firebase cuando useFirebase(), si no Supabase.
 */
export async function GET(req: NextRequest): Promise<NextResponse<HomeNextResponse | { error: string }>> {
  if (getDemoMode()) return NextResponse.json(demoNext());

  const cookieValue = req.cookies.get(PRECISAR_SESSION_COOKIE)?.value;
  if (cookieValue && isDemoCookieValue(cookieValue)) return NextResponse.json(demoNext());

  if (useFirebase()) {
    try {
      const auth = await getAuthFromRequest(req);
      const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
      const cohortId = enrollment?.cohort_id ?? null;

      const db = (await import("@/lib/firebase/admin")).getFirebaseAdminFirestore();
      const profileSnap = await db.collection("profiles").doc(auth.uid).get();
      const displayName = (profileSnap.data()?.full_name as string)?.trim() ?? auth.email?.split("@")[0] ?? "Estudiante";

      if (!cohortId) {
        return NextResponse.json({
          cohortId: null,
          courseId: null,
          firstLessonId: null,
          courseTitle: null,
          nextLessonTitle: null,
          nextLessonSummary: null,
          nextLabel: "Continuar",
          userName: displayName,
        });
      }

      const courseId = await firebaseContent.getPrimaryCourseForCohort(cohortId);
      if (!courseId) {
        return NextResponse.json({
          cohortId,
          courseId: null,
          firstLessonId: null,
          courseTitle: null,
          nextLessonTitle: null,
          nextLessonSummary: null,
          nextLabel: "Continuar",
          userName: displayName,
        });
      }

      const course = await firebaseContent.getPublishedCourse(courseId);
      if (!course) {
        return NextResponse.json({
          cohortId,
          courseId: null,
          firstLessonId: null,
          courseTitle: null,
          nextLessonTitle: null,
          nextLessonSummary: null,
          nextLabel: "Continuar",
          userName: displayName,
        });
      }

      const modules = await firebaseContent.getPublishedModules(courseId);
      const moduleIds = modules.map((m) => m.id);
      const lessons = await firebaseContent.getPublishedLessons(moduleIds);
      const firstLesson = lessons[0] ?? null;

      return NextResponse.json({
        cohortId,
        courseId,
        firstLessonId: firstLesson?.id ?? null,
        courseTitle: course.title,
        nextLessonTitle: firstLesson?.title ?? null,
        nextLessonSummary: firstLesson?.summary ?? null,
        nextLabel: "Continuar",
        userName: displayName,
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

  const profile = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
  const userName =
    (profile.data?.full_name as string)?.trim() || user.email?.split("@")[0] || "Estudiante";

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
      firstLessonId: null,
      courseTitle: null,
      nextLessonTitle: null,
      nextLessonSummary: null,
      nextLabel: "Continuar",
      userName,
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
      cohortId,
      courseId: null,
      firstLessonId: null,
      courseTitle: null,
      nextLessonTitle: null,
      nextLessonSummary: null,
      nextLabel: "Continuar",
      userName,
    });
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, title")
    .eq("id", courseId)
    .eq("status", "published")
    .single();

  if (!course) {
    return NextResponse.json({
      cohortId,
      courseId: null,
      firstLessonId: null,
      courseTitle: null,
      nextLessonTitle: null,
      nextLessonSummary: null,
      nextLabel: "Continuar",
      userName,
    });
  }

  const { data: mods } = await supabase
    .from("modules")
    .select("id")
    .eq("course_id", courseId)
    .eq("status", "published")
    .order("order_index", { ascending: true });

  const moduleIds = (mods ?? []).map((m: { id: string }) => m.id);
  let firstLessonId: string | null = null;

  let nextLessonTitle: string | null = null;
  let nextLessonSummary: string | null = null;

  if (moduleIds.length > 0) {
    const { data: less } = await supabase
      .from("lessons")
      .select("id, title, summary, order_index, module_id")
      .in("module_id", moduleIds)
      .eq("status", "published")
      .order("order_index", { ascending: true });
    const lessons = (less ?? []) as { id: string; title: string; summary: string | null; order_index: number; module_id: string }[];
    const ordered = [...lessons].sort((a, b) => {
      const ai = moduleIds.indexOf(a.module_id);
      const bi = moduleIds.indexOf(b.module_id);
      if (ai !== bi) return ai - bi;
      return a.order_index - b.order_index;
    });
    const first = ordered[0];
    if (first) {
      firstLessonId = first.id;
      nextLessonTitle = first.title;
      nextLessonSummary = first.summary ?? null;
    }
  }

  return NextResponse.json({
    cohortId,
    courseId,
    firstLessonId,
    courseTitle: course.title,
    nextLessonTitle,
    nextLessonSummary,
    nextLabel: "Continuar",
    userName,
  });
}
