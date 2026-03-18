import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import * as firebaseContent from "@/lib/services/firebase-content";
import * as firebaseProgress from "@/lib/services/firebase-progress";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { demoApiData, DEMO_MODULES, DEMO_LESSONS } from "@/lib/supabase/demo-mock";

export const dynamic = "force-dynamic";

type PendienteItem = { titulo: string; subtitulo: string; href: string; vence?: string };

function formatVence(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 86400000);
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (day.getTime() === today.getTime()) return "Vence hoy";
  if (day.getTime() === tomorrow.getTime()) return "Vence mañana";
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

function demoPendientes() {
  const now = Date.now();
  const urgentes: PendienteItem[] = [];
  const semana: PendienteItem[] = [];
  if (demoApiData.tasks.length > 0) {
    const t = demoApiData.tasks[0];
    const due = new Date(t.due_at).getTime();
    const item: PendienteItem = {
      titulo: t.title,
      subtitulo: "Tarea",
      href: "/tareas",
      vence: formatVence(t.due_at),
    };
    if (due - now < 2 * 86400000) urgentes.push(item);
    else semana.push(item);
  }
  const lecciones: PendienteItem[] = DEMO_LESSONS.slice(0, 3).map((l, i) => ({
    titulo: l.title,
    subtitulo: `Módulo ${(i % DEMO_MODULES.length) + 1}`,
    href: `/curso/lecciones/${l.id}`,
  }));
  const quizzes: PendienteItem[] = [
    { titulo: "Quiz Módulo 1", subtitulo: "Disponible", href: "/curso", vence: "Hoy 18:00" },
  ];
  return NextResponse.json({ urgentes, semana, lecciones, quizzes });
}

export async function GET(req: NextRequest) {
  if (getDemoMode()) return demoPendientes();

  if (useFirebase()) {
    try {
      const auth = await getAuthFromRequest(req);
      const enrollment = await firebaseContent.getActiveEnrollmentForUser(auth.uid);
      const cohortId = enrollment?.cohort_id ?? null;
      const courseId = await firebaseContent.getPrimaryCourseForCohort(cohortId ?? "");
      const urgentes: PendienteItem[] = [];
      const semana: PendienteItem[] = [];
      const lecciones: PendienteItem[] = [];
      const quizzes: PendienteItem[] = [];

      if (courseId) {
        const modules = await firebaseContent.getPublishedModules(courseId);
        const moduleIds = modules.map((m) => m.id);
        const lessons = await firebaseContent.getPublishedLessons(moduleIds);
        const { completedLessonIds } = await firebaseProgress.getProgress(auth.uid, courseId);
        const publishedIds = new Set(lessons.map((l) => l.id));
        const nextLessons = lessons.filter((l) => !completedLessonIds.includes(l.id)).slice(0, 5);
        for (const l of nextLessons) {
          const mod = modules.find((m) => m.id === l.module_id);
          lecciones.push({
            titulo: l.title,
            subtitulo: mod?.title ?? "Curso",
            href: `/curso/lecciones/${l.id}`,
          });
        }
      }

      return NextResponse.json({ urgentes, semana, lecciones, quizzes });
    } catch {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

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
  const now = new Date().toISOString();
  const inAWeek = new Date(Date.now() + 7 * 86400000).toISOString();

  const urgentes: PendienteItem[] = [];
  const semana: PendienteItem[] = [];
  const lecciones: PendienteItem[] = [];
  const quizzes: PendienteItem[] = [];

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, due_at, completed_at")
    .eq("user_id", user.id)
    .is("completed_at", null)
    .gte("due_at", now)
    .order("due_at", { ascending: true });

  for (const t of tasks ?? []) {
    const item: PendienteItem = {
      titulo: t.title,
      subtitulo: "Tarea",
      href: "/tareas",
      vence: formatVence(t.due_at),
    };
    const due = new Date(t.due_at).getTime();
    if (due - Date.now() < 2 * 86400000) urgentes.push(item);
    else if (t.due_at <= inAWeek) semana.push(item);
  }

  if (cohortId) {
    const { data: sessions } = await supabase
      .from("sessions")
      .select("id, title, scheduled_at")
      .eq("cohort_id", cohortId)
      .gte("scheduled_at", now)
      .order("scheduled_at", { ascending: true })
      .limit(3);
    for (const s of sessions ?? []) {
      semana.push({
        titulo: s.title,
        subtitulo: "Sesión en vivo",
        href: "/sesiones",
        vence: formatVence(s.scheduled_at),
      });
    }
  }

  const { data: cohortCourses } = await supabase
    .from("cohort_courses")
    .select("course_id")
    .eq("cohort_id", cohortId ?? "")
    .limit(1);
  const courseId = cohortCourses?.[0]?.course_id;
  if (courseId) {
    const { data: mods } = await supabase
      .from("modules")
      .select("id, title")
      .eq("course_id", courseId)
      .eq("status", "published")
      .order("order_index", { ascending: true });
    const moduleIds = (mods ?? []).map((m) => m.id);
    if (moduleIds.length > 0) {
      const { data: less } = await supabase
        .from("lessons")
        .select("id, title, module_id")
        .in("module_id", moduleIds)
        .eq("status", "published")
        .order("order_index", { ascending: true })
        .limit(10);
      for (const l of less ?? []) {
        const mod = mods?.find((m) => m.id === l.module_id);
        lecciones.push({
          titulo: l.title,
          subtitulo: mod?.title ?? "Curso",
          href: `/curso/lecciones/${l.id}`,
        });
      }
    }
  }

  return NextResponse.json({ urgentes, semana, lecciones, quizzes });
}
