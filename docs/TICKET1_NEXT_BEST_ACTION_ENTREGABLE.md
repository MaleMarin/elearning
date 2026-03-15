# TICKET 1 (Etapa 1) — Inicio “Next Best Action” + Ruta mínima del curso — Entregable

## Archivos tocados

| Archivo | Cambios |
|---------|---------|
| `app/api/home/next/route.ts` | **Nuevo.** GET que devuelve `{ cohortId, courseId, firstLessonId, courseTitle, nextLessonTitle, nextLessonSummary, nextLabel, userName }`. Usa Firebase (`getAuthFromRequest`, `getActiveEnrollmentForUser`, `getPrimaryCourseForCohort`, `getPublishedCourse`, `getPublishedModules`, `getPublishedLessons`) cuando `useFirebase()`, si no Supabase. Demo con datos de `demo-mock`. |
| `app/(app)/inicio/page.tsx` | Refactor: obtiene datos de `/api/home/next`. Si 401 → redirect `/login`. Si `!cohortId` → redirect `/no-inscrito`. Si `cohortId` y `!courseId` → EmptyState “Tu curso aparecerá aquí cuando esté asignado” + CTA “Ir a soporte”. Si `courseId` y `!firstLessonId` → EmptyState “El contenido se está preparando” + CTA “Ver curso”. Si hay `firstLessonId` → hero con “Continuar” a `/curso/lecciones/{firstLessonId}`, progreso “Listo para comenzar” si no hay progreso real, y grid (sessions, tasks, modules). Analytics `view_home` al cargar y `click_continue` al pulsar Continuar. |
| `components/dashboard/DashboardHero.tsx` | Saludo “Bienvenida/o, {nombre}” (prop `useBienvenida`). `progressLabel` opcional: si no hay progreso se muestra “Listo para comenzar”. `nextLabel` para el CTA (p. ej. “Continuar”). `onContinueClick` opcional para enviar evento y navegar desde la página. |
| `lib/analytics.ts` | **Nuevo.** `track(event, payload?)` con eventos `view_home` y `click_continue`; en desarrollo hace `console.debug`; preparado para integrar GA/Mixpanel luego. |

---

## Criterios de aceptación

1. **/inicio siempre muestra una acción útil o un empty state premium.**  
   - Con enrollment y curso con contenido: hero + “Continuar” + grid.  
   - Sin curso asignado: EmptyState “Tu curso aparecerá aquí cuando esté asignado” + “Ir a soporte”.  
   - Con curso sin lecciones publicadas: EmptyState “El contenido se está preparando” + “Ver curso”.  
   - Sin enrollment: redirect a `/no-inscrito`.

2. **Si existe curso published, “Continuar” abre una lección real.**  
   - El CTA lleva a `/curso/lecciones/{firstLessonId}` con la primera lección publicada (módulos por `position`, lecciones por `position`).

3. **No hay % inventado.**  
   - Si no hay progreso real (`lessonsDone === 0`), se muestra el texto “Listo para comenzar” en lugar de “0%”. La barra puede estar a 0.

4. **UI consistente y con volumen.**  
   - Se usan solo componentes del UI Kit: SurfaceCard, HeroCard/DashboardHero, PrimaryButton, EmptyState. Sin estilos ad-hoc.

---

## Cómo probar

### (a) Alumno sin curso asignado

- **Setup:** Usuario con sesión y enrollment activo en una cohorte que **no** tiene curso asignado (en Firebase: ninguna doc en `cohort_courses` para esa cohorte; en Supabase: sin filas en `cohort_courses` para ese `cohort_id`).
- Ir a `/inicio`.
- **Esperado:** No redirect. Se muestra **EmptyState** con título “Tu curso aparecerá aquí cuando esté asignado”, descripción y CTA **“Ir a soporte”** (enlace a `/soporte`). UI con SurfaceCard + PrimaryButton (paper premium).
- **Alternativa rápida (modo real):** Temporalmente en `GET /api/home/next` devolver `courseId: null` (manteniendo `cohortId`); recargar `/inicio` y comprobar el mismo EmptyState.

### (b) Alumno con curso asignado y lecciones publicadas

- **Setup:** Usuario con sesión, enrollment activo, cohorte con curso primary asignado y al menos un módulo y una lección con `status: "published"` (orden por position/order_index).
- Ir a `/inicio`.
- **Esperado:** Hero con “Bienvenida/o, {nombre}”, bloque “Continuar donde quedaste”, texto **“Listo para comenzar”** (si no hay progreso real; no se muestra “0%”). Botón **“Continuar”** que lleva a `/curso/lecciones/{firstLessonId}` (lección real). Al hacer clic: evento `click_continue` (consola en dev) y navegación a la lección. Debajo, grid con próxima sesión, tarea, módulos.
- **Modo demo:** Con `NEXT_PUBLIC_DEMO_MODE=true`, ir a `/inicio` → mismo hero y “Continuar” a `/curso/lecciones/demo-l1`. Consola: `[analytics] view_home` al cargar y `[analytics] click_continue` al pulsar Continuar.

### Otros casos

- **Sin enrollment** (`cohortId` null): al abrir `/inicio` → redirect a **/no-inscrito**.
- **Curso asignado pero sin módulos/lecciones publicadas** (`firstLessonId` null): EmptyState “El contenido se está preparando” + CTA “Ver curso”.

---

## Resumen

- **Next best action:** cohorte activa → curso primary (`cohort_courses.is_primary`) → primera lección publicada (módulos y lecciones por `position`).  
- **Sin dead ends:** redirect a `/no-inscrito` o EmptyState con CTA en todos los casos.  
- **Progreso:** sin % inventado; “Listo para comenzar” cuando no hay progreso.  
- **Analytics:** `view_home` al cargar vista, `click_continue` al pulsar Continuar.

*No se avanza al Ticket 2.*
