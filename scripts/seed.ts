/**
 * Seed: 1 admin, 1 mentor, 1 estudiante, 1 cohorte con comunidad, 2 posts, 1 ticket demo.
 *
 * Requisitos:
 * 1. Ejecutar antes la migración SQL en Supabase (001_assistant_system.sql).
 * 2. Crear en Supabase Auth (Dashboard o API) 3 usuarios y anotar sus UUIDs.
 * 3. Pasar esos UUIDs como variables de entorno o editar ADMIN_ID, MENTOR_ID, STUDENT_ID abajo.
 *
 * Uso: ADMIN_ID=uuid MENTOR_ID=uuid STUDENT_ID=uuid npx tsx scripts/seed.ts
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ADMIN_ID = process.env.ADMIN_ID ?? "00000000-0000-0000-0000-000000000001";
const MENTOR_ID = process.env.MENTOR_ID ?? "00000000-0000-0000-0000-000000000002";
const STUDENT_ID = process.env.STUDENT_ID ?? "00000000-0000-0000-0000-000000000003";

if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function seed() {
  console.log("Insertando perfiles...");
  await supabase.from("profiles").upsert(
    [
      { id: ADMIN_ID, email: "admin@demo.com", full_name: "Admin Demo", role: "admin" },
      { id: MENTOR_ID, email: "mentor@demo.com", full_name: "Mentor Demo", role: "mentor" },
      { id: STUDENT_ID, email: "estudiante@demo.com", full_name: "Estudiante Demo", role: "student" },
    ],
    { onConflict: "id" }
  );

  console.log("Insertando cohorte y curso...");
  const { data: cohort } = await supabase
    .from("cohorts")
    .insert({ name: "Cohorte Demo 2026" })
    .select("id")
    .single();
  if (!cohort) throw new Error("No se creó la cohorte");
  const cohortId = cohort.id;

  const { data: course } = await supabase
    .from("courses")
    .insert({ title: "Curso demo" })
    .select("id")
    .single();
  if (!course) throw new Error("No se creó el curso");

  console.log("Insertando cohort_members...");
  await supabase.from("cohort_members").insert([
    { cohort_id: cohortId, user_id: MENTOR_ID, role: "mentor" },
    { cohort_id: cohortId, user_id: STUDENT_ID, role: "student" },
  ]);

  console.log("Insertando 2 posts de comunidad...");
  const { data: post1 } = await supabase
    .from("community_posts")
    .insert({
      cohort_id: cohortId,
      user_id: STUDENT_ID,
      title: "Bienvenida al curso",
      body: "Hola, ¿cuándo empiezan las entregas?",
    })
    .select("id")
    .single();
  const { data: post2 } = await supabase
    .from("community_posts")
    .insert({
      cohort_id: cohortId,
      user_id: STUDENT_ID,
      title: "Duda sobre el proyecto",
      body: "No entiendo el enunciado del proyecto final.",
    })
    .select("id")
    .single();

  if (post1) {
    await supabase.from("community_comments").insert({
      post_id: post1.id,
      user_id: MENTOR_ID,
      body: "Las entregas son cada viernes.",
    });
  }

  console.log("Insertando 1 ticket demo...");
  await supabase.from("support_tickets").insert({
    user_id: STUDENT_ID,
    cohort_id: cohortId,
    category: "acceso",
    status: "open",
    summary: "No puedo entrar al módulo 2",
    details: "Al hacer clic en el módulo 2 me redirige al inicio.",
  });

  console.log("Seed completado.");
  console.log("Cohorte ID (para /comunidad):", cohortId);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
