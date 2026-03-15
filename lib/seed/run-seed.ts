/**
 * Seed idempotente para STAGING.
 * Si ya existe el curso "Programa Demo – 4 semanas", no duplica.
 * Uso: desde POST /api/seed (con SEED_SECRET) o desde script npm run seed:staging.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

const DEMO_COURSE_TITLE = "Programa Demo – 4 semanas";

const ADMIN_ID = process.env.ADMIN_ID ?? "00000000-0000-0000-0000-000000000001";
const MENTOR_ID = process.env.MENTOR_ID ?? "00000000-0000-0000-0000-000000000002";
const STUDENT_ID = process.env.STUDENT_ID ?? "00000000-0000-0000-0000-000000000003";

export type SeedResult = { ok: true; cohortId: string; courseId: string; skipped?: boolean } | { ok: false; error: string };

export async function runStagingSeed(supabase: SupabaseClient): Promise<SeedResult> {
  const { data: existing } = await supabase
    .from("courses")
    .select("id")
    .eq("title", DEMO_COURSE_TITLE)
    .limit(1)
    .single();

  if (existing) {
    const { data: cohortRow } = await supabase
      .from("cohort_courses")
      .select("cohort_id")
      .eq("course_id", existing.id)
      .limit(1)
      .single();
    return {
      ok: true,
      cohortId: cohortRow?.cohort_id ?? "",
      courseId: existing.id,
      skipped: true,
    };
  }

  // Perfiles
  await supabase.from("profiles").upsert(
    [
      { id: ADMIN_ID, email: "admin@demo.com", full_name: "Admin Demo", role: "admin" },
      { id: MENTOR_ID, email: "mentor@demo.com", full_name: "Mentor Demo", role: "mentor" },
      { id: STUDENT_ID, email: "estudiante@demo.com", full_name: "Estudiante Demo", role: "student" },
    ],
    { onConflict: "id" }
  );

  // Grupo 4 semanas
  const { data: cohort, error: cohortErr } = await supabase
    .from("cohorts")
    .insert({ name: "Grupo Demo – 4 semanas" })
    .select("id")
    .single();
  if (cohortErr || !cohort) return { ok: false, error: cohortErr?.message ?? "No se creó el grupo" };
  const cohortId = cohort.id;

  // Curso
  const { data: course, error: courseErr } = await supabase
    .from("courses")
    .insert({ title: DEMO_COURSE_TITLE, status: "published" })
    .select("id")
    .single();
  if (courseErr || !course) return { ok: false, error: courseErr?.message ?? "No se creó el curso" };
  const courseId = course.id;

  await supabase.from("cohort_courses").insert({ cohort_id: cohortId, course_id: courseId });
  await supabase.from("cohort_members").insert([
    { cohort_id: cohortId, user_id: MENTOR_ID, role: "mentor" },
    { cohort_id: cohortId, user_id: STUDENT_ID, role: "student" },
  ]);

  // 4 módulos (Semana 1–4)
  const { data: modules } = await supabase
    .from("modules")
    .insert([
      { course_id: courseId, title: "Semana 1", order_index: 0, status: "published" },
      { course_id: courseId, title: "Semana 2", order_index: 1, status: "published" },
      { course_id: courseId, title: "Semana 3", order_index: 2, status: "published" },
      { course_id: courseId, title: "Semana 4", order_index: 3, status: "published" },
    ])
    .select("id, order_index");

  const orderedModules = (modules ?? []).sort((a, b) => a.order_index - b.order_index);
  if (orderedModules.length < 4) return { ok: false, error: "No se crearon los 4 módulos" };

  const [m1, m2, m3, m4] = orderedModules;

  const lessonPayloads = [
    { module_id: m1.id, title: "Bienvenida y objetivos", summary: "Objetivos del programa.", content: "Contenido placeholder: bienvenida y objetivos en español.", order_index: 0, status: "published" as const },
    { module_id: m1.id, title: "Introducción a los conceptos clave", summary: "Conceptos clave de la semana 1.", content: "Contenido placeholder: conceptos clave en español.", order_index: 1, status: "published" as const },
    { module_id: m2.id, title: "Desarrollo de habilidades", summary: "Habilidades a desarrollar.", content: "Contenido placeholder: desarrollo de habilidades en español.", order_index: 0, status: "published" as const },
    { module_id: m2.id, title: "Ejercicios prácticos", summary: "Ejercicios de la semana 2.", content: "Contenido placeholder: ejercicios prácticos en español.", order_index: 1, status: "published" as const },
    { module_id: m3.id, title: "Profundización", summary: "Contenido avanzado.", content: "Contenido placeholder: profundización en español.", order_index: 0, status: "published" as const },
    { module_id: m3.id, title: "Casos de uso", summary: "Casos de uso reales.", content: "Contenido placeholder: casos de uso en español.", order_index: 1, status: "published" as const },
    { module_id: m4.id, title: "Cierre y siguientes pasos", summary: "Cierre del programa.", content: "Contenido placeholder: cierre y siguientes pasos en español.", order_index: 0, status: "published" as const },
  ];

  const { error: lessonsErr } = await supabase.from("lessons").insert(lessonPayloads);
  if (lessonsErr) return { ok: false, error: lessonsErr.message };

  // 4 sesiones (una por semana) con meeting_url placeholder
  const baseDate = new Date();
  const sessions = [
    { cohort_id: cohortId, title: "Sesión 1 – Kickoff", scheduled_at: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), meeting_url: "https://zoom.us/j/placeholder-1" },
    { cohort_id: cohortId, title: "Sesión 2", scheduled_at: new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(), meeting_url: "https://zoom.us/j/placeholder-2" },
    { cohort_id: cohortId, title: "Sesión 3", scheduled_at: new Date(baseDate.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(), meeting_url: "https://zoom.us/j/placeholder-3" },
    { cohort_id: cohortId, title: "Sesión 4 – Cierre", scheduled_at: new Date(baseDate.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString(), meeting_url: "https://zoom.us/j/placeholder-4" },
  ];
  await supabase.from("sessions").insert(sessions);

  // 3 tareas con instrucciones y due_at
  const taskBase = new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000);
  const tasks = [
    { user_id: STUDENT_ID, cohort_id: cohortId, title: "Tarea 1 – Lectura", instructions: "Leer el material de la Semana 1 y resumir en un párrafo.", due_at: new Date(taskBase.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() },
    { user_id: STUDENT_ID, cohort_id: cohortId, title: "Tarea 2 – Ejercicio", instructions: "Completar el ejercicio práctico de la Semana 2 y subir el resultado.", due_at: new Date(taskBase.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString() },
    { user_id: STUDENT_ID, cohort_id: cohortId, title: "Tarea 3 – Proyecto final", instructions: "Entregar el proyecto final según las instrucciones del módulo 4.", due_at: new Date(taskBase.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString() },
  ];
  await supabase.from("tasks").insert(tasks);

  // Comunidad: 2 posts + 2 comentarios + 1 post fijado
  const { data: postPinned } = await supabase
    .from("community_posts")
    .insert({
      cohort_id: cohortId,
      user_id: MENTOR_ID,
      title: "Bienvenida – Normas de la comunidad",
      body: "Bienvenidos al programa. Por favor lean las normas y respeten a los compañeros.",
      pinned: true,
    })
    .select("id")
    .single();

  const { data: post1 } = await supabase
    .from("community_posts")
    .insert({
      cohort_id: cohortId,
      user_id: STUDENT_ID,
      title: "¿Cuándo empiezan las entregas?",
      body: "Hola, ¿cuándo tenemos que entregar la primera tarea?",
      pinned: false,
    })
    .select("id")
    .single();

  const { data: post2 } = await supabase
    .from("community_posts")
    .insert({
      cohort_id: cohortId,
      user_id: STUDENT_ID,
      title: "Duda sobre el proyecto final",
      body: "No entiendo el enunciado del proyecto final. ¿Alguien puede explicar?",
      pinned: false,
    })
    .select("id")
    .single();

  if (post1?.id) {
    await supabase.from("community_comments").insert({
      post_id: post1.id,
      user_id: MENTOR_ID,
      body: "Las entregas son cada viernes. Revisa el calendario en la pestaña Tareas.",
    });
  }
  if (post2?.id) {
    await supabase.from("community_comments").insert({
      post_id: post2.id,
      user_id: MENTOR_ID,
      body: "En la lección de Cierre está el enunciado detallado. Si sigue la duda, pregúntame en el próximo vivo.",
    });
  }

  // 1 ticket de soporte demo
  await supabase.from("support_tickets").insert({
    user_id: STUDENT_ID,
    cohort_id: cohortId,
    category: "acceso",
    status: "open",
    summary: "No puedo entrar al módulo 2",
    details: "Al hacer clic en el módulo 2 me redirige al inicio. Ya probé en otro navegador.",
  });

  return { ok: true, cohortId, courseId };
}
