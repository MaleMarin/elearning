/**
 * Mocks de Supabase para NEXT_PUBLIC_DEMO_MODE=true.
 * No se realizan llamadas reales a Supabase.
 */

export const DEMO_USER = {
  id: "demo-user-id",
  email: "demo@demo.com",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as const;

/** Nombre para saludo en UI (demo). */
export const DEMO_USER_DISPLAY_NAME = "Maria Flores";

const DEMO_COURSE = { id: "demo-course-id", title: "Fundamentos del programa", status: "published" };
export const DEMO_MODULES = [
  { id: "demo-m1", title: "Módulo 1: Introducción y contexto", order_index: 0 },
  { id: "demo-m2", title: "Módulo 2: Herramientas y metodología", order_index: 1 },
  { id: "demo-m3", title: "Módulo 3: Práctica guiada", order_index: 2 },
  { id: "demo-m4", title: "Módulo 4: Integración y cierre", order_index: 3 },
];
export const DEMO_LESSONS = [
  { id: "demo-l1", title: "Introducción al programa", module_id: "demo-m1", order_index: 0, summary: "Conoce los objetivos del curso y cómo aprovecharlo al máximo.", content: "Contenido placeholder.", status: "published" },
  { id: "demo-l2", title: "Contenido principal y ejercicios", module_id: "demo-m1", order_index: 1, summary: "Desarrolla las competencias clave con ejemplos y actividades.", content: "Contenido.", status: "published" },
];
const DEMO_SESSION = {
  id: "demo-session-1",
  cohort_id: "demo-cohort",
  title: "Sesión en vivo: Preguntas y repaso",
  scheduled_at: new Date(Date.now() + 86400000).toISOString(),
  meeting_url: "https://zoom.us/j/demo",
};
const DEMO_TASK = {
  id: "demo-task-1",
  title: "Entrega: Ejercicio práctico del Módulo 1",
  due_at: new Date(Date.now() + 172800000).toISOString(),
  completed_at: null,
  cohort_id: "demo-cohort",
  instructions: "Completa el ejercicio y sube tu evidencia según las instrucciones.",
};
const DEMO_POSTS = [
  { id: "demo-p1", title: "Bienvenida al grupo", body: "Hola a todos, bienvenidos al curso. Aquí podéis compartir dudas y recursos. ¡Nos vemos en la primera sesión!", pinned: true, created_at: new Date().toISOString(), user_id: "demo-user-id" },
  { id: "demo-p2", title: "Duda sobre la tarea del Módulo 1", body: "¿Alguien ya entregó el ejercicio? Me gustaría contrastar criterios antes de enviar.", pinned: false, created_at: new Date().toISOString(), user_id: "demo-user-id" },
];

function emptyData() {
  return Promise.resolve({ data: [], error: null });
}

function singleRow<T>(row: T) {
  return Promise.resolve({ data: row, error: null });
}

/** Mock para uso en servidor (API routes). */
export function createDemoServerMock() {
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: DEMO_USER }, error: null }),
    },
    from: (table: string) => ({
      select: (_cols?: string) => ({
        eq: () => ({
          single: () => {
            if (table === "profiles") return singleRow({ id: DEMO_USER.id, role: "student" });
            if (table === "courses") return singleRow(DEMO_COURSE);
            return singleRow(null);
          },
          order: () => emptyData(),
          limit: () => emptyData(),
        }),
        in: () => emptyData(),
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      single: () => singleRow(null),
    }),
  };
}

/** Mock para uso en cliente (React). */
export function createDemoBrowserMock() {
  const auth = {
    getUser: () => Promise.resolve({ data: { user: DEMO_USER }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: { user: DEMO_USER }, error: null }),
    signUp: () => Promise.resolve({ data: { user: DEMO_USER }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  };

  const orderResult = (table: string) =>
    Promise.resolve(
      table === "modules"
        ? { data: DEMO_MODULES, error: null }
        : table === "lessons"
          ? { data: DEMO_LESSONS, error: null }
          : { data: [] as typeof DEMO_MODULES, error: null }
    );

  const from = (table: string) => {
    const eqChain = (col: string, _val: unknown) => ({
      single: () => {
        if (table === "profiles") return singleRow({ id: DEMO_USER.id, role: "student" });
        if (table === "courses" && col === "id") return singleRow(DEMO_COURSE);
        if (table === "modules" && col === "course_id") return singleRow(DEMO_MODULES[0]);
        if (table === "lessons" && (col === "module_id" || col === "id")) return singleRow(DEMO_LESSONS[0]);
        return singleRow(null);
      },
      order: (_opts?: unknown) => orderResult(table),
      eq: eqChain,
      limit: () => emptyData(),
    });
    return {
      select: (_cols?: string) => ({
        eq: eqChain,
        order: (_opts?: unknown) => orderResult(table),
        in: () => emptyData(),
      }),
    };
  };

  return { auth, from };
}

export const DEMO_COURSE_ID = DEMO_COURSE.id;
export const DEMO_NEXT_LESSON = DEMO_LESSONS[0]; /* siguiente lección para "Continuar" */

/** Datos placeholder para respuestas de API en modo demo. */
export const demoApiData = {
  enrolled: true,
  courses: [DEMO_COURSE],
  sessions: [DEMO_SESSION],
  tasks: [DEMO_TASK],
  certificates: [] as unknown[],
  posts: DEMO_POSTS,
  cohortId: "demo-cohort",
};
