/**
 * Seed: Curso "Ciberseguridad para Funcionarios Públicos de México"
 * 4 módulos × 7.5 h, basado en COBIT 2019, CISM, CRISC, CDPSE, ISACA.
 *
 * Uso: ADMIN_ID=uid npx tsx scripts/seed-ciberseguridad.ts
 * Requiere Firebase (FIREBASE_SERVICE_ACCOUNT_JSON). Crea el curso en draft;
 * el admin aplica la plantilla "Ciberseguridad" en Funcionalidades y publica cuando esté listo.
 */

import * as firebaseContent from "../lib/services/firebase-content";
import * as courseFeaturesService from "../lib/services/course-features";
import type { CourseFeatures } from "../lib/types/course-features";
import { DEFAULT_COURSE_FEATURES } from "../lib/types/course-features";

const COURSE_TITLE = "Ciberseguridad para Funcionarios Públicos de México";
const COURSE_DESCRIPTION =
  "Curso de 30 horas (4 módulos × 7.5 h) dirigido a funcionarios públicos federales y estatales de México. " +
  "Basado en COBIT 2019, CISM, CRISC, CDPSE e ISACA. Certificación con QR verificable. Evaluación mínima aprobatoria: 6/10.";

/** Plantilla ciberseguridad (misma que en FeatureFlagsPanel). */
const CIBER_FEATURES: CourseFeatures = {
  ...DEFAULT_COURSE_FEATURES,
  audioLecciones: true,
  diarioAprendizaje: true,
  evaluacionFinal: true,
  certificado: true,
  qrVerificacion: true,
  peerReview: true,
  whatsapp: true,
  sesionesEnVivo: true,
  grabaciones: true,
  spacedRepetition: true,
  bibliografia: true,
  checkInBienestar: true,
  badges: true,
  miColega: true,
  mentores: true,
  retosCohorte: true,
  portafolioTransformacion: true,
  foro: true,
  podcasts: true,
  pushNotifications: true,
};

const MODULES: {
  title: string;
  description: string;
  objectives: string[];
  rewardLabel: string;
  lessons: { title: string; summary: string; content: string; estimated_minutes: number }[];
}[] = [
  {
    title: "Fundamentos de Confianza Digital y Gobierno de TI",
    description:
      "Comprender la diferencia entre gobierno de TI y gestión operativa para generar valor a los ciudadanos. Marco COBIT 2019, dominios EDM y APO, principios adaptables al sector público.",
    objectives: [
      "Comprender los dominios EDM y APO del marco COBIT 2019.",
      "Identificar los 6 principios del sistema de gobierno adaptables al sector público.",
      "Aplicar los conceptos de gobierno vs. gestión en tu dependencia.",
    ],
    rewardLabel: "Insignia Fundamentos COBIT",
    lessons: [
      {
        title: "Introducción y objetivos del módulo",
        summary: "Presentación del módulo y resultados de aprendizaje.",
        content:
          "En este módulo aprenderás a distinguir entre **gobierno de TI** y **gestión operativa** y cómo aplicar el marco COBIT 2019 en el sector público.\n\n**Objetivos:**\n- Comprender los dominios EDM (Evaluar, Dirigir, Monitorear) y APO (Alinear, Planificar, Organizar).\n- Identificar los 6 principios del sistema de gobierno adaptables al sector público.\n- Aplicar estos conceptos en tu dependencia.",
        estimated_minutes: 30,
      },
      {
        title: "Contenido teórico: COBIT 2019 y gobierno de TI",
        summary: "Marco COBIT 2019, dominios Gobierno vs. Gestión.",
        content:
          "## Marco COBIT 2019\n\n- **Dominios de Gobierno (EDM):** Evaluar, Dirigir, Monitorear — establecen estrategia y supervisión.\n- **Dominios de Gestión (APO):** Alinear, Planificar, Organizar — ejecutan y operan.\n\n## 6 principios del sistema de gobierno\n\n1. Proveer valor a las partes interesadas.\n2. Enfoque holístico.\n3. Gobierno dinámico.\n4. Gobierno distinto de la gestión.\n5. Adaptado a las necesidades de la organización.\n6. Sistema de gobierno de extremo a extremo.\n\n**Caso de referencia:** Ministerio que evalúa riesgos antes de comprar software.",
        estimated_minutes: 120,
      },
      {
        title: "Video: Gobernanza vs. Gestión en el Estado",
        summary: "Animación con caso: ministerio y evaluación de riesgos (máx. 8 min).",
        content:
          "**Video:** *Gobernanza vs. Gestión en el Estado*\n\nAnimación gráfica con narración (Principio de Modalidad de Mayer). Caso: ministerio que evalúa riesgos antes de comprar software.\n\n*Inserte aquí la URL del video o use el bloque de video en el editor.*",
        estimated_minutes: 10,
      },
      {
        title: "Actividad individual: Caso de estudio",
        summary: "Identificar elementos de Gobierno vs. Gestión en tu dependencia.",
        content:
          "**Actividad:** Lectura de caso de estudio.\n\nIdentifica qué elementos corresponden a **Gobierno** y cuáles a **Gestión** en tu dependencia. Redacta un párrafo breve (máx. 200 palabras) y envíalo como entrega.",
        estimated_minutes: 60,
      },
      {
        title: "Actividad en equipo: Sistema de Gobierno Dinámico",
        summary: "En grupos de 4, diseñar un sistema básico para una dependencia ficticia.",
        content:
          "**Actividad en equipo (grupos de 4):**\n\nDiseña un \"Sistema de Gobierno Dinámico\" básico para una dependencia ficticia, priorizando servicios ciudadanos.\n\nEntregable: documento breve (1–2 páginas) con los elementos de gobierno y gestión propuestos.",
        estimated_minutes: 90,
      },
      {
        title: "Quiz: COBIT 2019",
        summary: "5 preguntas de opción múltiple con escenarios. Si falla → repaso.",
        content:
          "**Quiz:** 5 preguntas de opción múltiple con escenarios. Si fallas alguna pregunta, se activa el repaso sobre COBIT 2019.\n\n**Glosario del módulo:** Confianza Digital, COBIT 2019, Gobernanza de TI, Gestión de TI, Dominio EDM.\n\n**Bibliografía:** ISACA — Marco COBIT 2019: Introducción y Metodología.",
        estimated_minutes: 40,
      },
    ],
  },
  {
    title: "Gestión de Seguridad y Riesgos Tecnológicos",
    description:
      "Desarrollar habilidades para identificar vulnerabilidades, gestionar incidentes y crear planes de continuidad (CISM y CRISC).",
    objectives: [
      "Identificar vulnerabilidades y gestionar riesgos de información.",
      "Aplicar protocolos de respuesta a incidentes y continuidad (BCP/DRP).",
      "Comunicar crisis de ciberseguridad con prensa y ciudadanos.",
    ],
    rewardLabel: "Insignia Gestión de Riesgos",
    lessons: [
      {
        title: "Introducción y objetivos del módulo",
        summary: "Seguridad institucional, riesgos e incidentes.",
        content:
          "**Objetivo:** Desarrollar habilidades para identificar vulnerabilidades, gestionar incidentes y crear planes de continuidad (CISM y CRISC).\n\nTemas: estrategias de seguridad institucional, gestión de riesgos de información, respuesta a incidentes, BCP y DRP.",
        estimated_minutes: 30,
      },
      {
        title: "Contenido teórico: Seguridad, riesgos y continuidad",
        summary: "Estrategias de seguridad, BCP, DRP, respuesta a incidentes.",
        content:
          "## Estrategias de seguridad institucional\n\n- Gestión de riesgos de información.\n- Respuesta a incidentes.\n- BCP (Business Continuity Plan) y DRP (Disaster Recovery Plan).\n\nReferencias: manuales de preparación CISM y CRISC (ISACA).",
        estimated_minutes: 120,
      },
      {
        title: "Video: Un día bajo ataque — Ransomware en la AP",
        summary: "Storytelling del ataque paso a paso (máx. 10 min).",
        content:
          "**Video:** *Un día bajo ataque: Ransomware en la Administración Pública*\n\nStorytelling en lenguaje cotidiano (Principio de Personalización de Mayer). Duración: máximo 10 minutos.\n\n*Inserte aquí la URL del video.*",
        estimated_minutes: 12,
      },
      {
        title: "Actividad individual: Diálogo simulado de crisis",
        summary: "Rol de gestor de crisis: comunicación con prensa y ciudadanos.",
        content:
          "**Actividad:** Diálogo simulado.\n\nAsume el rol de gestor de crisis y toma decisiones de comunicación con prensa y ciudadanos tras una filtración de datos. Redacta un plan de comunicación (máx. 1 página).",
        estimated_minutes: 60,
      },
      {
        title: "Actividad en equipo: Protocolo de Respuesta a Incidentes",
        summary: "Crear protocolo BCP/Respuesta para sistemas de atención ciudadana.",
        content:
          "**Actividad en equipo:** Crear colaborativamente un protocolo de Respuesta a Incidentes y Continuidad (BCP) para los sistemas de atención ciudadana de tu departamento.\n\n**Glosario:** Ransomware, BCP, DRP, CISM, CRISC, Vulnerabilidad.",
        estimated_minutes: 90,
      },
      {
        title: "Quiz: Amenazas y controles",
        summary: "Arrastrar y soltar: relacionar amenazas con controles de mitigación.",
        content:
          "**Quiz:** Actividad \"arrastrar y soltar\" — relacionar amenazas cibernéticas con sus controles de mitigación.\n\n**Bibliografía:** ISACA — Manual de Preparación para CISM y CRISC.",
        estimated_minutes: 38,
      },
    ],
  },
  {
    title: "Privacidad por Diseño y Protección de Datos",
    description:
      "Garantizar que los sistemas gubernamentales protejan datos sensibles desde su concepción (CDPSE). Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados.",
    objectives: [
      "Aplicar ingeniería de privacidad y privacidad por diseño en sistemas públicos.",
      "Evaluar ecosistemas digitales con ITAF 5.",
      "Cumplir la LFPDPPP en tu dependencia.",
    ],
    rewardLabel: "Insignia Privacidad por Diseño",
    lessons: [
      {
        title: "Introducción y objetivos del módulo",
        summary: "Privacidad por diseño y protección de datos en gobierno.",
        content:
          "**Objetivo:** Garantizar que los sistemas gubernamentales protejan datos sensibles desde su concepción (CDPSE).\n\nTemas: ingeniería de privacidad, privacidad por diseño, evaluación de ecosistemas digitales (ITAF 5), LFPDPPP.",
        estimated_minutes: 30,
      },
      {
        title: "Contenido teórico: Privacidad por diseño y LFPDPPP",
        summary: "Ingeniería de privacidad, ITAF 5, ley mexicana.",
        content:
          "## Ingeniería de privacidad\n\n- \"Privacidad por diseño\" en sistemas públicos.\n- Evaluación de ecosistemas digitales completos (ITAF 5).\n- **Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados de México.**\n\nReferencias: INAI — Guías de cumplimiento.",
        estimated_minutes: 120,
      },
      {
        title: "Video: El viaje del dato ciudadano",
        summary: "Del formulario al cifrado en la nube (máx. 8 min).",
        content:
          "**Video:** *El viaje del dato ciudadano*\n\nSigue un dato personal desde que el ciudadano llena un formulario hasta su cifrado en la nube. Máximo 8 minutos (Principio de Segmentación de Mayer).\n\n*Inserte aquí la URL del video.*",
        estimated_minutes: 10,
      },
      {
        title: "Actividad individual: Análisis de flujo de datos",
        summary: "Identificar 3 puntos ciegos de privacidad en tu dependencia.",
        content:
          "**Actividad:** Analiza el flujo de recolección de datos de tu dependencia e identifica **3 puntos ciegos** donde la privacidad del ciudadano está en riesgo. Entrega un informe breve.",
        estimated_minutes: 60,
      },
      {
        title: "Actividad en equipo: Foro dilema ético",
        summary: "Debate asíncrono: controles de acceso vs. leyes de transparencia.",
        content:
          "**Actividad en equipo:** Foro de debate asíncrono.\n\nDilema ético: ¿Cómo equilibrar controles de acceso estrictos con las leyes de transparencia gubernamental?\n\n*Peer review activado para esta actividad.*",
        estimated_minutes: 90,
      },
      {
        title: "Quiz: Evaluación formativa",
        summary: "Evaluación con feedback inmediato (diagnóstico y corrección).",
        content:
          "**Quiz:** Evaluación formativa con feedback inmediato (Heurística de Nielsen 9).\n\n**Glosario:** Privacidad por Diseño, Ingeniería de Privacidad, CDPSE, Ecosistema Digital, ITAF 5.\n\n**Bibliografía:** ITAF 5ta Edición; LFPDPPP; INAI — Guías de cumplimiento.",
        estimated_minutes: 40,
      },
    ],
  },
  {
    title: "Ciber-resiliencia, IA y Normativas Globales",
    description:
      "Preparar a las instituciones para riesgos emergentes de IA y regulaciones internacionales (NIS2, DORA, CMMC).",
    objectives: [
      "Evaluar el impacto de la IA generativa en ciberseguridad.",
      "Conocer NIS2, DORA y CMMC y su impacto en la contratación pública.",
      "Usar el AI Audit Toolkit para auditar riesgos de algoritmos.",
    ],
    rewardLabel: "Insignia Ciber-resiliencia",
    lessons: [
      {
        title: "Introducción y objetivos del módulo",
        summary: "IA, normativas globales y ciber-resiliencia.",
        content:
          "**Objetivo:** Preparar a las instituciones para riesgos emergentes de IA y regulaciones internacionales.\n\nTemas: impacto de la IA generativa en ciberseguridad, NIS2 y DORA, CMMC, contratación de software internacional.",
        estimated_minutes: 30,
      },
      {
        title: "Contenido teórico: IA, NIS2, DORA y CMMC",
        summary: "Normativas europeas y estadounidenses, impacto en México.",
        content:
          "## Impacto de la IA generativa en ciberseguridad\n\n- Manipulación de datos, deepfakes.\n- **Normativas NIS2 y DORA** (UE) — impacto en proveedores del gobierno mexicano.\n- **CMMC** (Cybersecurity Maturity Model Certification) de EUA.\n- Cómo afectan la contratación de software internacional.",
        estimated_minutes: 120,
      },
      {
        title: "Video: La IA y las Fronteras Digitales",
        summary: "Expertos: IA automatiza ataques y defensas (máx. 12 min).",
        content:
          "**Video:** *La IA y las Fronteras Digitales*\n\nEntrevistas a expertos explicando cómo la IA automatiza ataques y defensas. Duración: máximo 12 minutos.\n\n*Inserte aquí la URL del video.*",
        estimated_minutes: 14,
      },
      {
        title: "Actividad individual: Ensayo DORA y NIS2",
        summary: "Cómo DORA y NIS2 afectan la contratación de proveedores por el gobierno.",
        content:
          "**Actividad:** Ensayo reflexivo.\n\nRedacta un ensayo (1–2 páginas) sobre cómo DORA y NIS2 afectan la forma en que el gobierno mexicano contrata proveedores internacionales.",
        estimated_minutes: 60,
      },
      {
        title: "Actividad en equipo: AI Audit Toolkit",
        summary: "Auditar riesgo de un algoritmo ficticio que asigna subsidios públicos.",
        content:
          "**Actividad en equipo:** Usar el \"AI Audit Toolkit\" de ISACA para auditar el riesgo de un algoritmo ficticio que asigna subsidios públicos.\n\n*Peer review activado para esta actividad.*",
        estimated_minutes: 90,
      },
      {
        title: "Examen final integrador",
        summary: "Examen de los 4 módulos. Nota mínima 6/10 para certificado.",
        content:
          "**Examen final integrador** de los 4 módulos. Nota mínima **6/10** para aprobar y obtener el certificado.\n\n**Glosario:** IA Generativa, NIS2, DORA, CMMC, Ciber-resiliencia, AI Audit Toolkit.\n\n**Bibliografía:** ISACA — Whitepaper 2025 COBIT for AI Governance; AI Audit Toolkit 2025; ENISA — Guías NIS2.",
        estimated_minutes: 46,
      },
    ],
  },
];

async function run() {
  const createdBy = process.env.ADMIN_ID ?? "seed-ciberseguridad";
  console.log("Creando curso:", COURSE_TITLE);
  const course = await firebaseContent.createCourse(
    createdBy,
    COURSE_TITLE,
    "draft",
    COURSE_DESCRIPTION
  );
  const courseId = course.id as string;
  console.log("Curso creado:", courseId);

  for (let i = 0; i < MODULES.length; i++) {
    const mod = MODULES[i];
    const module_ = await firebaseContent.createModule(
      courseId,
      mod.title,
      i,
      "draft",
      mod.description
    );
    const moduleId = module_.id as string;
    console.log("Módulo creado:", moduleId, mod.title);
    await firebaseContent.updateModule(moduleId, {
      objectives: mod.objectives,
      reward_label: mod.rewardLabel,
    });

    for (let j = 0; j < mod.lessons.length; j++) {
      const les = mod.lessons[j];
      await firebaseContent.createLesson(moduleId, {
        title: les.title,
        summary: les.summary,
        content: les.content,
        order_index: j,
        status: "draft",
        estimated_minutes: les.estimated_minutes,
      });
    }
    console.log("  Lecciones:", mod.lessons.length);
  }

  await courseFeaturesService.setCourseFeatures(courseId, CIBER_FEATURES);
  console.log("Feature flags aplicados (plantilla Ciberseguridad).");

  console.log("\nListo. Curso ID:", courseId);
  console.log("Siguiente: publicar curso y módulos/lecciones desde Admin cuando esté listo.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
