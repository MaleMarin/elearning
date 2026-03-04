/**
 * Seed PROD: solo datos mínimos (sin demo).
 * - Opcional: asegurar perfil admin si ADMIN_ID está definido.
 * Uso: npm run seed:prod
 * Requiere: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function seed() {
  const adminId = process.env.ADMIN_ID;
  if (adminId) {
    console.log("[prod] Asegurando perfil admin...");
    await supabase.from("profiles").upsert(
      { id: adminId, role: "admin" },
      { onConflict: "id" }
    );
  }
  console.log("[prod] Seed mínimo completado.");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
