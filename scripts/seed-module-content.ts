/**
 * Seed: contenido del módulo 1 (bibliografía, podcasts, videos) en Firestore.
 *
 * Uso: MODULE_ID=opcional npx tsx scripts/seed-module-content.ts
 * Si no se pasa MODULE_ID, se usa el primer módulo (order_index) del primer curso publicado.
 * Requiere FIREBASE_SERVICE_ACCOUNT_JSON y uso de Firebase (no demo).
 */

import { getFirebaseAdminFirestore } from "../lib/firebase/admin";

const DEMO_BIB = [
  {
    id: "bib1",
    tipo: "libro" as const,
    titulo: "La innovación pública al servicio del ciudadano",
    autor: "OCDE",
    año: 2023,
    descripcion: "Marco conceptual de la OCDE para modernizar los servicios públicos en América Latina.",
    url: "https://www.oecd.org/gov/innov",
    obligatorio: true,
  },
  {
    id: "bib2",
    tipo: "paper" as const,
    titulo: "Design thinking en el sector público mexicano",
    autor: "CIDE — Centro de Investigación y Docencia Económicas",
    año: 2022,
    descripcion: "Casos de aplicación en 5 dependencias federales de México.",
    obligatorio: true,
  },
  {
    id: "bib3",
    tipo: "reporte" as const,
    titulo: "Gobierno Digital en México: Diagnóstico 2024",
    autor: "Secretaría de la Función Pública",
    año: 2024,
    url: "https://www.gob.mx/sfp",
    descripcion: "Estado actual de la transformación digital en las dependencias federales.",
    obligatorio: false,
  },
];

const DEMO_PODCASTS = [
  {
    id: "pod1",
    titulo: "Ep. 34 — Innovación desde adentro del gobierno",
    programa: "GovTech Latinoamérica",
    descripcion: "Entrevista con servidores públicos que transformaron sus áreas sin grandes presupuestos.",
    duracion: "38 min",
    url: "https://open.spotify.com/episode/example",
  },
  {
    id: "pod2",
    titulo: "Ep. 12 — Por qué el gobierno necesita diseñadores",
    programa: "Diseño Público",
    descripcion: "Cómo el design thinking está cambiando los trámites en América Latina.",
    duracion: "25 min",
    url: "https://open.spotify.com/episode/example2",
  },
];

const DEMO_VIDEOS = [
  {
    id: "vid1",
    titulo: "Qué es la innovación pública — en 5 minutos",
    canal: "BID Banco Interamericano de Desarrollo",
    descripcion: "Introducción clara y accesible al concepto de innovación en el sector público.",
    duracion: "5 min",
    youtubeId: "dQw4w9WgXcQ",
    esObligatorio: true,
  },
  {
    id: "vid2",
    titulo: "Casos de éxito: Estonia, el gobierno digital más avanzado",
    canal: "DW Español",
    descripcion: "Cómo Estonia digitalizó el 99% de sus servicios públicos en 20 años.",
    duracion: "12 min",
    youtubeId: "dQw4w9WgXcQ",
    esObligatorio: false,
  },
];

async function seed() {
  const db = getFirebaseAdminFirestore();
  const moduleId = process.env.MODULE_ID;

  let targetModuleId = moduleId;

  if (!targetModuleId) {
    const coursesSnap = await db.collection("courses").where("status", "==", "published").limit(1).get();
    if (coursesSnap.empty) {
      console.error("No hay ningún curso publicado. Crea un curso y publica al menos un módulo.");
      process.exit(1);
    }
    const courseId = coursesSnap.docs[0]!.id;
    const modulesSnap = await db
      .collection("modules")
      .where("course_id", "==", courseId)
      .orderBy("order_index", "asc")
      .limit(1)
      .get();
    if (modulesSnap.empty) {
      console.error("No hay módulos en el curso. Crea al menos un módulo.");
      process.exit(1);
    }
    targetModuleId = modulesSnap.docs[0]!.id;
    console.log("Usando primer módulo del primer curso publicado:", targetModuleId);
  }

  const ref = db.collection("modules").doc(targetModuleId);
  const snap = await ref.get();
  if (!snap.exists) {
    console.error("Módulo no encontrado:", targetModuleId);
    process.exit(1);
  }

  await ref.update({
    visibilityMode: "preview",
    bibliography: DEMO_BIB,
    podcasts: DEMO_PODCASTS,
    videos: DEMO_VIDEOS,
    updated_at: new Date().toISOString(),
  });

  console.log("Contenido del módulo sembrado correctamente:", targetModuleId);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
