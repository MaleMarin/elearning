/**
 * Seed STAGING: datos completos de demo (Programa Demo – 4 semanas).
 * Uso: npm run seed:staging
 * Requiere: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Opcional: ADMIN_ID, MENTOR_ID, STUDENT_ID
 * Idempotente: si ya existe el curso demo, no duplica.
 */
import { createAdminClient } from "../lib/supabase/admin";
import { runStagingSeed } from "../lib/seed/run-seed";

async function main() {
  const supabase = createAdminClient();
  const result = await runStagingSeed(supabase);

  if (!result.ok) {
    console.error("[staging] Error:", result.error);
    process.exit(1);
  }

  if (result.skipped) {
    console.log("[staging] Seed ya existía (curso demo presente). cohortId:", result.cohortId);
  } else {
    console.log("[staging] Seed completado. cohortId:", result.cohortId, "courseId:", result.courseId);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
