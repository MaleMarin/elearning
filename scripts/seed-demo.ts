/**
 * Datos de demostración para Política Digital.
 * Ejecutar: npx tsx scripts/seed-demo.ts
 * Requiere FIREBASE_SERVICE_ACCOUNT_JSON en .env.local (o variable de entorno).
 */
import { getFirebaseAdminFirestore } from "../lib/firebase/admin";

async function seedDemo() {
  console.log("🌱 Creando datos de demostración...");

  const db = getFirebaseAdminFirestore();
  const now = new Date().toISOString();

  const cursoRef = await db.collection("courses").add({
    title: "Ciberseguridad para Gobierno Digital",
    description:
      "Aprende a proteger los datos y sistemas de tu institución pública.",
    status: "published",
    created_at: now,
    updated_at: now,
    created_by: "seed-demo",
  });
  const courseId = cursoRef.id;
  console.log("✅ Curso creado:", courseId);

  const modRef = await db.collection("modules").add({
    course_id: courseId,
    title: "Introducción a la Ciberseguridad",
    order_index: 1,
    status: "published",
    description: "Fundamentos y buenas prácticas.",
    created_at: now,
    updated_at: now,
  });
  const moduleId = modRef.id;

  await db.collection("lessons").add({
    module_id: moduleId,
    title: "Cifrado E2E — Cómo proteger tus datos",
    summary: "El cifrado de extremo a extremo garantiza que solo tú y el destinatario puedan leer los mensajes.",
    content: `
## Introducción al Cifrado

El cifrado de extremo a extremo (E2E) garantiza que solo tú y el destinatario puedan leer los mensajes.

### Puntos clave
- Qué significa E2E
- Por qué es importante en gobierno
- Herramientas recomendadas
    `.trim(),
    order_index: 1,
    status: "published",
    estimated_minutes: 8,
    created_at: now,
    updated_at: now,
  });

  console.log("✅ Módulo y lección creados");
  console.log("🎉 Seed completado. Abre localhost:3000/inicio para ver los datos.");
  process.exit(0);
}

seedDemo().catch((err) => {
  console.error(err);
  process.exit(1);
});
