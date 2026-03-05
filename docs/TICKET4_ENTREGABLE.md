# Ticket 4 — Dashboard /inicio con datos reales + empty states premium

## Resumen

/inicio deja de ser demo duro: usa cohortId del enrollment activo, carga próxima sesión, próxima tarea, último post de comunidad y módulos reales (o empty states premium). Fondo #F3F2EF, cards del UI Kit, panel derecho con datos reales.

---

## 1. Fuente de datos

- **cohortId:** desde `enrollments` (user_id = auth, status = 'active', order by created_at desc limit 1). Si no hay, dashboard devuelve cohortId null y vacíos.
- **GET /api/dashboard** (nuevo): una sola llamada que devuelve:
  - cohortId, userName (profiles.full_name o email)
  - nextSession: `sessions` donde cohort_id = X y scheduled_at >= now(), order scheduled_at asc limit 1
  - nextTask: `tasks` donde user_id = auth y (cohort_id = X o null) y completed_at is null y due_at >= now(), order due_at asc limit 1
  - lastPost: último `community_posts` de la cohorte (order created_at desc limit 1) con author_name desde profiles
  - progress: lessonsDone (0 por ahora), lessonsTotal (lecciones publicadas en módulos de cursos de la cohorte)
  - modules: módulos publicados de cursos asignados a la cohorte (cohort_courses → modules); en DEMO_MODE se envían DEMO_MODULES
  - nextLessonHref, nextLessonTitle, nextLessonSummary: primera lección del primer curso de la cohorte (o null)
- **Módulos:** Si no hay cursos/módulos reales, no se muestran módulos demo salvo en DEMO_MODE (la API en demo devuelve showDemoModules: true y modules demo).

---

## 2. Diseño

- Fondo global: #F3F2EF (ya en layout y variables CSS).
- Cards: SurfaceCard, estilo paper premium (border, shadow del kit).
- Hero compacto: "Continuar donde quedaste" con progreso y CTA "Seguir con el curso" o empty state "Tu contenido aparecerá aquí..." + "Ir a curso".
- CTA primario: Seguir con el curso.
- CTA coral: Entrar a Zoom (en NextSessionCard cuando hay meeting_url).
- Panel derecho (RightRail): Progreso, Comunidad, Próxima sesión con datos de /api/dashboard (sin skeletons permanentes).

---

## 3. Componentes

- **DashboardHero:** userName, progressPct, nextLessonTitle/Summary/Href. Si no hay siguiente lección → empty state inline + "Ir a curso".
- **NextSessionCard:** session | null. Con sesión: título, fecha/hora, botón "Entrar a Zoom" (coral) o "Ver sesiones". Empty: "Cuando el mentor programe la próxima sesión, aparecerá aquí." + "Ver sesiones".
- **NextTaskCard:** task | null. Con tarea: título, vence, "Ver tarea". Empty: "Aún no tienes tareas pendientes." + "Ver tareas".
- **ModulesOverviewCard:** modules[], showDemoModules. Si modules.length === 0 → EmptyState "Tu contenido aparecerá aquí cuando el equipo publique el curso." + "Ir a curso". Si hay módulos → lista con enlace al curso.
- **ProgressSummaryCard:** lessonsDone, lessonsTotal (disponible para uso; progreso también en Hero y RightRail).
- **CommunityPreviewCard:** post | null (disponible; comunidad en RightRail). Empty: "Sé la primera persona en publicar en tu cohorte." + "Crear post".

---

## 4. Empty states (premium)

- Sesiones: "Cuando el mentor programe la próxima sesión, aparecerá aquí." + botón "Ver sesiones".
- Tareas: "Aún no tienes tareas pendientes." + botón "Ver tareas".
- Comunidad: "Sé la primera persona en publicar en tu cohorte." + botón "Crear post".
- Curso/módulos: "Tu contenido aparecerá aquí cuando el equipo publique el curso." + botón "Ir a curso".

---

## 5. Reglas de acceso

- /inicio solo accesible con enrollment activo (middleware Ticket 2/3).
- DEMO_MODE: /api/dashboard devuelve datos demo (sessions, tasks, posts, modules demo, nextLesson); bypass de acceso se mantiene.

---

## Archivos tocados

| Archivo | Cambio |
|--------|--------|
| `app/api/dashboard/route.ts` | Nuevo: GET dashboard (cohortId, session, task, post, progress, modules, nextLesson). |
| `app/(app)/inicio/page.tsx` | Usa /api/dashboard, DashboardHero, NextSessionCard, NextTaskCard, ModulesOverviewCard; loading con placeholders breves. |
| `components/dashboard/DashboardHero.tsx` | Rediseño: props desde API, empty state cuando no hay siguiente lección. |
| `components/dashboard/NextSessionCard.tsx` | SurfaceCard, empty state premium, CTA coral "Entrar a Zoom". |
| `components/dashboard/NextTaskCard.tsx` | SurfaceCard, empty state premium, "Ver tareas". |
| `components/dashboard/ModulesOverviewCard.tsx` | Empty state cuando no hay módulos; lista con enlace a /cursos/[courseId]. |
| `components/dashboard/ProgressSummaryCard.tsx` | Nuevo: X de Y lecciones + ProgressBar. |
| `components/dashboard/CommunityPreviewCard.tsx` | Nuevo: último post o empty state "Crear post". |
| `components/layout/RightRail.tsx` | Datos reales desde /api/dashboard (progreso, comunidad, próxima sesión). |

---

## Criterios de aceptación

- Usuario con enrollment activo ve /inicio sin errores.
- Si hay sessions/assignments/posts se muestran (próxima sesión, próxima tarea, último post en rail).
- Si no hay, empty states con mensajes útiles y CTA.
- No hay skeletons grandes permanentes (solo un loading breve al montar).
- UI coherente con el sistema visual (fondo #F3F2EF, cards, botones primario/coral).
- DEMO_MODE sigue mostrando datos demo en dashboard y rail.

No avanzar al Ticket 5 hasta validar /inicio con datos reales.
