/**
 * Seed completo — Política Digital · Contenido demo para activar el 90% de funcionalidades.
 * Ejecutar: npx tsx scripts/seed-completo.ts   o   npm run seed:completo
 * Requiere: FIREBASE_SERVICE_ACCOUNT_JSON en .env.local (o variable de entorno).
 */
import * as path from "path";
import * as dotenv from "dotenv";

const projectRoot = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(projectRoot, ".env.local") });
dotenv.config({ path: path.join(projectRoot, ".env") });

import { Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "../lib/firebase/admin";

const COURSE_ID = "curso-innovacion-publica";
const MOD_1_ID = "mod-ciberseguridad";
const MOD_2_ID = "mod-datos-abiertos";
const MOD_3_ID = "mod-innovacion";
const COHORT_ID = "grupo-demo-2026";
const DEMO_UID = "demo-user";

async function seedCompleto() {
  console.log("🌱 Iniciando seed completo de Política Digital...\n");
  const db = getFirebaseAdminFirestore();
  const now = new Date().toISOString();

  // ═══════════════════════════════════════
  // 1. CURSO
  // ═══════════════════════════════════════
  await db.collection("courses").doc(COURSE_ID).set({
    title: "Innovación Pública Digital",
    description:
      "Desarrolla las competencias digitales necesarias para transformar tu institución pública. Aprende ciberseguridad, datos abiertos, participación ciudadana e innovación en gobierno.",
    status: "published",
    created_at: now,
    updated_at: now,
    created_by: "seed-completo",
  });
  console.log("✅ Curso creado: Innovación Pública Digital");

  // ═══════════════════════════════════════
  // 2. MÓDULOS (colección modules, course_id)
  // ═══════════════════════════════════════
  await db.collection("modules").doc(MOD_1_ID).set({
    course_id: COURSE_ID,
    title: "Ciberseguridad para el Servicio Público",
    description:
      "Protege los datos de los ciudadanos y aprende a identificar amenazas digitales en tu institución.",
    order_index: 1,
    status: "published",
    created_at: now,
    updated_at: now,
    objectives: [
      "Identificar las principales amenazas de ciberseguridad en el sector público",
      "Aplicar el principio de Zero Trust en tu trabajo diario",
      "Proteger datos personales conforme a la LFPDPPP",
    ],
    reward_label: "Guardián Digital",
  });

  await db.collection("modules").doc(MOD_2_ID).set({
    course_id: COURSE_ID,
    title: "Datos Abiertos para la Transparencia",
    description:
      "Aprende a publicar, consumir y usar datos abiertos para mejorar la transparencia y los servicios públicos.",
    order_index: 2,
    status: "published",
    created_at: now,
    updated_at: now,
    objectives: [
      "Comprender el ecosistema de datos abiertos en México",
      "Publicar datasets conforme a los estándares internacionales",
      "Usar datos abiertos para tomar mejores decisiones",
    ],
    reward_label: "Embajador de Transparencia",
  });

  await db.collection("modules").doc(MOD_3_ID).set({
    course_id: COURSE_ID,
    title: "Innovación y Diseño de Servicios Públicos",
    description:
      "Metodologías de innovación para transformar los servicios que brindas a los ciudadanos.",
    order_index: 3,
    status: "published",
    created_at: now,
    updated_at: now,
    objectives: [
      "Aplicar design thinking al diseño de servicios públicos",
      "Usar metodologías ágiles en proyectos de gobierno",
      "Medir el impacto de las innovaciones en los ciudadanos",
    ],
    reward_label: "Innovador Público",
  });
  console.log("✅ 3 módulos creados");

  // ═══════════════════════════════════════
  // 3. LECCIONES (colección lessons, module_id)
  // ═══════════════════════════════════════
  const lessons = [
    {
      id: "les-cifrado-e2e",
      module_id: MOD_1_ID,
      title: "Cifrado de extremo a extremo: protege tus comunicaciones",
      summary:
        "Aprende qué es el cifrado E2E y por qué es esencial para proteger información sensible del gobierno.",
      content: `
<h2>¿Qué es el cifrado de extremo a extremo?</h2>
<p>El cifrado E2E (End-to-End) garantiza que solo el remitente y el destinatario pueden leer un mensaje. Ni siquiera el proveedor del servicio puede acceder al contenido.</p>
<h3>¿Por qué importa en el servicio público?</h3>
<p>Como servidor público manejas información sensible: datos de ciudadanos, decisiones de política, presupuestos. Sin cifrado, esta información puede ser interceptada.</p>
<h3>Casos reales en México</h3>
<p>En 2023, varios sistemas de instituciones gubernamentales fueron comprometidos por no usar cifrado adecuado. Los datos de millones de ciudadanos quedaron expuestos.</p>
<h3>AES-256: el estándar de oro</h3>
<p>El estándar militar AES-256 es el más seguro disponible hoy. Política Digital usa AES-256 para proteger tu diario y carta al yo futuro.</p>
      `.trim(),
      video_embed_url: "https://www.youtube.com/embed/AQDCe585Lnc",
      estimated_minutes: 15,
      order_index: 1,
    },
    {
      id: "les-zero-trust",
      module_id: MOD_1_ID,
      title: "Zero Trust: nunca confíes, siempre verifica",
      summary:
        "El modelo de seguridad que está transformando las instituciones más seguras del mundo.",
      content: `
<h2>¿Qué es Zero Trust?</h2>
<p>Zero Trust es un modelo de seguridad que asume que ninguna persona, dispositivo o sistema es confiable por defecto, incluso si están dentro de la red de la institución.</p>
<h3>Los 3 principios de Zero Trust</h3>
<ul>
<li><strong>Verificar explícitamente:</strong> Autenticar y autorizar siempre, basándose en todos los datos disponibles.</li>
<li><strong>Mínimo privilegio:</strong> Limitar el acceso de los usuarios al mínimo necesario.</li>
<li><strong>Asumir la brecha:</strong> Diseñar como si ya hubiera sido comprometido.</li>
</ul>
<h3>Cómo aplicarlo en tu institución</h3>
<p>1. Implementar autenticación multifactor (MFA) para todos los usuarios.</p>
<p>2. Revisar los permisos de acceso cada 90 días.</p>
<p>3. Registrar todos los accesos a sistemas críticos.</p>
      `.trim(),
      video_embed_url: "https://www.youtube.com/embed/DP-wBnTBvus",
      estimated_minutes: 12,
      order_index: 2,
    },
    {
      id: "les-lfpdppp",
      module_id: MOD_1_ID,
      title: "LFPDPPP: protege los datos de los ciudadanos",
      summary:
        "Conoce la Ley Federal de Protección de Datos Personales y cómo cumplirla en tu trabajo diario.",
      content: `
<h2>¿Qué es la LFPDPPP?</h2>
<p>La Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) establece los derechos de los ciudadanos sobre sus datos personales.</p>
<h3>Derechos ARCO</h3>
<ul>
<li><strong>Acceso:</strong> El ciudadano puede ver qué datos tienes de él.</li>
<li><strong>Rectificación:</strong> Puede corregir datos incorrectos.</li>
<li><strong>Cancelación:</strong> Puede pedir que elimines sus datos.</li>
<li><strong>Oposición:</strong> Puede oponerse al uso de sus datos.</li>
</ul>
<h3>Tu responsabilidad como servidor público</h3>
<p>Si manejas datos de ciudadanos, eres responsable de protegerlos. Una brecha de datos puede resultar en sanciones del INAI y afectar la confianza ciudadana.</p>
      `.trim(),
      video_embed_url: null,
      estimated_minutes: 10,
      order_index: 3,
    },
    {
      id: "les-que-son-datos",
      module_id: MOD_2_ID,
      title: "¿Qué son los datos abiertos y por qué importan?",
      summary: "Introducción al ecosistema de datos abiertos en México y el mundo.",
      content: `
<h2>Datos abiertos: el petróleo del siglo XXI</h2>
<p>Los datos abiertos son datos que cualquier persona puede acceder, usar y redistribuir libremente. En el sector público, son fundamentales para la transparencia y la rendición de cuentas.</p>
<h3>Ejemplos en México</h3>
<p>datos.gob.mx publica más de 40,000 conjuntos de datos de instituciones federales. Desde estadísticas de salud hasta información sobre presupuesto.</p>
<h3>Impacto real</h3>
<p>Los datos abiertos han permitido crear aplicaciones que ayudan a los ciudadanos a encontrar servicios, monitorear el gasto público y detectar irregularidades.</p>
      `.trim(),
      video_embed_url: "https://www.youtube.com/embed/vrTKaehqKCY",
      estimated_minutes: 12,
      order_index: 1,
    },
    {
      id: "les-publicar-datos",
      module_id: MOD_2_ID,
      title: "Cómo publicar datos abiertos de calidad",
      summary:
        "Estándares, formatos y mejores prácticas para publicar datos que la ciudadanía pueda usar.",
      content: `
<h2>Los 5 principios de los datos abiertos</h2>
<ol>
<li><strong>Completos:</strong> Todos los datos públicos disponibles.</li>
<li><strong>Primarios:</strong> De la fuente original, sin agregación.</li>
<li><strong>Oportunos:</strong> Publicados lo más rápido posible.</li>
<li><strong>Accesibles:</strong> Para el mayor público posible.</li>
<li><strong>Procesables por máquinas:</strong> En formatos estructurados (CSV, JSON).</li>
</ol>
<h3>Formatos recomendados</h3>
<p>CSV para tablas, JSON para APIs, GeoJSON para datos geográficos. Evita PDF y Excel para datos que serán procesados.</p>
      `.trim(),
      video_embed_url: null,
      estimated_minutes: 15,
      order_index: 2,
    },
    {
      id: "les-usar-datos",
      module_id: MOD_2_ID,
      title: "Usar datos para tomar mejores decisiones",
      summary:
        "Aprende a analizar y visualizar datos públicos para mejorar políticas y servicios.",
      content: `
<h2>Del dato a la decisión</h2>
<p>Tener datos no es suficiente. La clave está en transformarlos en información útil para tomar mejores decisiones de política pública.</p>
<h3>Herramientas gratuitas</h3>
<ul>
<li><strong>Google Data Studio:</strong> Visualizaciones de datos gratuitas.</li>
<li><strong>CKAN:</strong> Plataforma de gestión de datos abiertos.</li>
<li><strong>OpenRefine:</strong> Limpieza y transformación de datos.</li>
</ul>
      `.trim(),
      video_embed_url: null,
      estimated_minutes: 10,
      order_index: 3,
    },
    {
      id: "les-design-thinking",
      module_id: MOD_3_ID,
      title: "Design Thinking para el sector público",
      summary:
        "Cómo poner al ciudadano en el centro del diseño de servicios gubernamentales.",
      content: `
<h2>¿Qué es el Design Thinking?</h2>
<p>Design Thinking es una metodología centrada en las personas para resolver problemas complejos de manera creativa e innovadora.</p>
<h3>Las 5 etapas</h3>
<ol>
<li><strong>Empatizar:</strong> Comprender profundamente las necesidades del ciudadano.</li>
<li><strong>Definir:</strong> Formular el problema real que hay que resolver.</li>
<li><strong>Idear:</strong> Generar soluciones creativas sin limitaciones.</li>
<li><strong>Prototipar:</strong> Crear versiones simples y rápidas de las soluciones.</li>
<li><strong>Testear:</strong> Probar con ciudadanos reales y aprender.</li>
</ol>
      `.trim(),
      video_embed_url: "https://www.youtube.com/embed/a7sEoEvT8l8",
      estimated_minutes: 18,
      order_index: 1,
    },
    {
      id: "les-agile-gobierno",
      module_id: MOD_3_ID,
      title: "Metodologías ágiles en el gobierno",
      summary:
        "Scrum, Kanban y otras metodologías ágiles adaptadas al contexto del servicio público.",
      content: `
<h2>¿Por qué ágil en el gobierno?</h2>
<p>Los proyectos de gobierno suelen ser lentos, costosos y entregar resultados que ya no son relevantes. Las metodologías ágiles permiten entregar valor de forma incremental.</p>
<h3>Scrum para equipos de gobierno</h3>
<p>Sprints de 2 semanas, retrospectivas constantes y entregas frecuentes al ciudadano. Muchas instituciones en el mundo ya lo usan.</p>
<h3>Casos de éxito</h3>
<p>El gobierno de Reino Unido transformó sus servicios digitales usando metodologías ágiles, reduciendo costos en 40% y mejorando la satisfacción ciudadana.</p>
      `.trim(),
      video_embed_url: null,
      estimated_minutes: 14,
      order_index: 2,
    },
    {
      id: "les-medir-impacto",
      module_id: MOD_3_ID,
      title: "Medir el impacto de la innovación pública",
      summary:
        "Indicadores, métricas y métodos para evaluar si tus innovaciones realmente mejoran la vida de los ciudadanos.",
      content: `
<h2>¿Cómo saber si tu innovación funciona?</h2>
<p>Sin medición, no hay aprendizaje. Definir indicadores claros desde el inicio es fundamental para saber si estamos generando valor real.</p>
<h3>El marco OKR para gobierno</h3>
<p>Objectives and Key Results (OKR) es un método para definir metas ambiciosas y medir el progreso de forma transparente.</p>
<h3>Ejemplo real</h3>
<p>Objetivo: Reducir el tiempo de tramitación del servicio X. Resultado clave: De 30 días a 5 días para el 80% de los trámites en 6 meses.</p>
      `.trim(),
      video_embed_url: null,
      estimated_minutes: 10,
      order_index: 3,
    },
  ];

  for (const les of lessons) {
    const { id, module_id, ...rest } = les;
    await db.collection("lessons").doc(id).set({
      module_id,
      ...rest,
      status: "published",
      source_community: false,
      created_at: now,
      updated_at: now,
    });
  }
  console.log("✅ 9 lecciones creadas");

  // ═══════════════════════════════════════
  // 4. BANCO DE PREGUNTAS (question_bank: un doc por pregunta)
  // ═══════════════════════════════════════
  const questions = [
    {
      id: "q1",
      courseId: COURSE_ID,
      moduleId: MOD_1_ID,
      question: "¿Qué significa E2E en el contexto del cifrado?",
      type: "multiple_choice" as const,
      options: ["Extremo a extremo", "Error to Error", "Encriptación Total", "Estándar Empresarial"],
      correctAnswer: "Extremo a extremo",
      explanation:
        "E2E significa \"Extremo a Extremo\" — solo el remitente y destinatario pueden leer el mensaje.",
      difficulty: "easy" as const,
      tags: ["ciberseguridad"],
    },
    {
      id: "q2",
      courseId: COURSE_ID,
      moduleId: MOD_1_ID,
      question: "¿Cuál es el principio central del modelo Zero Trust?",
      type: "multiple_choice" as const,
      options: ["Confiar en los usuarios internos", "Nunca confiar, siempre verificar", "Usar solo VPN", "Cifrar todos los archivos"],
      correctAnswer: "Nunca confiar, siempre verificar",
      explanation: "Zero Trust asume que ningún usuario o sistema es confiable por defecto.",
      difficulty: "medium" as const,
      tags: ["ciberseguridad"],
    },
    {
      id: "q3",
      courseId: COURSE_ID,
      moduleId: MOD_1_ID,
      question: "¿Qué significa ARCO en la LFPDPPP?",
      type: "multiple_choice" as const,
      options: [
        "Acceso, Rectificación, Cancelación, Oposición",
        "Autorización, Registro, Control, Operación",
        "Archivo, Reporte, Cifrado, Operación",
        "Acceso, Reporte, Control, Oposición",
      ],
      correctAnswer: "Acceso, Rectificación, Cancelación, Oposición",
      explanation: "ARCO son los 4 derechos que tiene el ciudadano sobre sus datos personales.",
      difficulty: "medium" as const,
      tags: ["datos-personales"],
    },
    {
      id: "q4",
      courseId: COURSE_ID,
      moduleId: MOD_2_ID,
      question: "¿Cuál es el formato recomendado para publicar datos tabulares como datos abiertos?",
      type: "multiple_choice" as const,
      options: ["PDF", "Excel (.xlsx)", "CSV", "Word (.docx)"],
      correctAnswer: "CSV",
      explanation: "CSV es el formato más accesible y procesable por máquinas para datos tabulares.",
      difficulty: "easy" as const,
      tags: ["datos-abiertos"],
    },
    {
      id: "q5",
      courseId: COURSE_ID,
      moduleId: MOD_3_ID,
      question: "¿Cuáles son las 5 etapas del Design Thinking?",
      type: "multiple_choice" as const,
      options: [
        "Planear, Diseñar, Construir, Probar, Lanzar",
        "Empatizar, Definir, Idear, Prototipar, Testear",
        "Analizar, Diseñar, Desarrollar, Implementar, Evaluar",
        "Investigar, Proponer, Aprobar, Ejecutar, Medir",
      ],
      correctAnswer: "Empatizar, Definir, Idear, Prototipar, Testear",
      explanation: "Design Thinking tiene 5 etapas: Empatizar, Definir, Idear, Prototipar y Testear.",
      difficulty: "medium" as const,
      tags: ["innovacion"],
    },
    {
      id: "q6",
      courseId: COURSE_ID,
      moduleId: MOD_2_ID,
      question: "¿Verdadero o falso? Los datos abiertos deben estar disponibles en formatos que puedan ser procesados por máquinas.",
      type: "true_false" as const,
      options: ["Verdadero", "Falso"],
      correctAnswer: "Verdadero",
      explanation:
        "Verdadero. Uno de los 5 principios de los datos abiertos es que sean procesables por máquinas.",
      difficulty: "easy" as const,
      tags: ["datos-abiertos"],
    },
  ];

  for (const q of questions) {
    const { id, ...data } = q;
    await db.collection("question_bank").doc(id).set({
      ...data,
      createdAt: now,
    });
  }
  console.log("✅ Banco de 6 preguntas creado");

  // Quiz de ejemplo (opcional para /curso y completion)
  await db.collection("quizzes").doc("quiz-innovacion-publica").set({
    courseId: COURSE_ID,
    title: "Evaluación Innovación Pública Digital",
    questionCount: 6,
    passingScore: 60,
    timeLimit: 600,
    randomizeQuestions: true,
    randomizeOptions: true,
    maxAttempts: 3,
    showExplanations: true,
    moduleId: null,
    createdAt: now,
    updatedAt: now,
  });
  console.log("✅ Quiz de curso creado");

  // ═══════════════════════════════════════
  // 5. RETO DE GRUPO (cohorts/{cohortId}/challenges)
  // ═══════════════════════════════════════
  const challengeRef = db.collection("cohorts").doc(COHORT_ID).collection("challenges").doc();
  const fechaInicio = Timestamp.fromDate(new Date());
  const fechaFin = Timestamp.fromDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
  await challengeRef.set({
    titulo: "Mapea 3 riesgos de ciberseguridad en tu institución",
    descripcion:
      "Identifica y documenta 3 vulnerabilidades de seguridad digital en tu institución pública. Comparte tu análisis con el grupo y propón soluciones concretas.",
    fechaInicio,
    fechaFin,
    estado: "activo",
    criteriosEvaluacion: [
      "Identifica vulnerabilidades reales (no hipotéticas)",
      "Propone al menos 1 solución por cada riesgo",
      "El análisis es claro y aplicable",
    ],
    premioDescripcion: "Logro \"Guardián Digital\" + mención en la comunidad",
    ganador: null,
    createdAt: Timestamp.now(),
  });
  console.log("✅ Reto de grupo creado");

  // ═══════════════════════════════════════
  // 6. GRUPO / COHORTE Y VINCULACIÓN AL CURSO
  // ═══════════════════════════════════════
  await db.collection("cohorts").doc(COHORT_ID).set({
    name: "Grupo Demo 2026",
    description: "Cohorte de prueba para Innovación Pública Digital",
    starts_at: now,
    ends_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    timezone: "America/Mexico_City",
    capacity: 50,
    is_active: true,
    created_at: now,
    updated_at: now,
  });

  await db.collection("cohort_courses").add({
    cohort_id: COHORT_ID,
    course_id: COURSE_ID,
    is_primary: true,
  });
  console.log("✅ Grupo Demo 2026 y cohort_courses creados");

  // ═══════════════════════════════════════
  // 7. INSCRIPCIÓN DEL USUARIO DEMO
  // ═══════════════════════════════════════
  await db.collection("enrollments").add({
    user_id: DEMO_UID,
    cohort_id: COHORT_ID,
    status: "active",
    created_at: now,
  });
  console.log("✅ Usuario demo inscrito al curso");

  // ═══════════════════════════════════════
  // 8. GRAFO DE CONOCIMIENTO (institutions/default para admin/conocimiento)
  // ═══════════════════════════════════════
  const nodeIds = ["ciberseguridad", "cifrado-e2e", "zero-trust", "lfpdppp", "datos-abiertos", "formatos-abiertos", "innovacion-publica", "design-thinking", "agile"];
  const instRef = db.collection("institutions").doc("default");
  for (const id of nodeIds) {
    await instRef.collection("knowledgeGraph").doc(id).set({
      concepto: id.replace(/-/g, " "),
      usuariosQueLoDominan: 0,
      nivelPromedio: 50,
      relacionados: [],
      modulo: "",
      ultimaActualizacion: Timestamp.now(),
    });
  }
  console.log("✅ Nodos de conocimiento (default) creados");

  console.log("\n🎉 SEED COMPLETO FINALIZADO");
  console.log("════════════════════════════");
  console.log("✅ 1 curso publicado (Innovación Pública Digital)");
  console.log("✅ 3 módulos con 9 lecciones");
  console.log("✅ 6 preguntas + 1 quiz");
  console.log("✅ 1 reto de grupo activo");
  console.log("✅ Grupo Demo 2026 + cohort_courses + enrollment (demo-user)");
  console.log("✅ Grafo de conocimiento (institutions/default)");
  console.log("\n👉 Con Firebase activo, inicia sesión con un usuario cuyo uid coincida con el enrollment (ej. demo-user) o usa modo demo en la app.");
  process.exit(0);
}

seedCompleto().catch((err) => {
  console.error("❌ Error en seed:", err);
  process.exit(1);
});
