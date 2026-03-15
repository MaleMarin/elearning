# Ticket 2 (Etapa 1) — Ruta del curso (alumno): navegación Anterior/Siguiente + Checkpoints por módulo

## Resumen

- **GET /api/curso**: devuelve `course`, `modules` (con `lessons` anidados y `lessonCount`), `firstLessonId`. Solo contenido published. Sin curso asignado → 200 con `course: null`, `modules: []`.
- **GET /api/curso/lecciones/[lessonId]**: devuelve `lesson`, `module` (id, title, index, totalModules), `prevLessonId`, `nextLessonId`. prev/next en orden global (cruzando módulos). No encontrada o no publicada → **404**.
- **UI /curso**: PageSection (título + CTA Continuar), PageSection "Módulos y lecciones", SurfaceCard por módulo ("Módulo X: …" + "N lecciones"), ListRow por lección con Badge "Pendiente" / "En curso" (primera lección) y chevron.
- **UI /curso/lecciones/[lessonId]**: checkpoint "Módulo X de Y • {nombre módulo}", Badge "En curso", PageSection título/subtítulo, SurfaceCard contenido, footer con SecondaryButton "Anterior" y PrimaryButton "Siguiente" (disabled cuando no hay prev/next).
- **Redirect** `/cursos` → `/curso` ya existía en `app/cursos/page.tsx`.

---

## Archivos tocados

| Archivo | Cambio |
|--------|--------|
| `app/api/curso/route.ts` | Payload: `modules` como `CursoModuleWithLessons[]` (id, title, position, status, lessonCount, lessons[]). Helper `buildModulesWithLessons`. Demo, Firebase y Supabase devuelven la nueva forma. |
| `app/api/curso/lecciones/[lessonId]/route.ts` | Añadido `module: { id, title, index, totalModules }`. Respuesta 404 cuando lección no existe o no publicada. Rama **Firebase** (auth, enrollment, curso primary, getLesson, getModule, getPublishedModules/Lessons, prev/next). `lesson` incluye `moduleId`, `position`. Demo y Supabase actualizados con `module` y 404. |
| `app/curso/page.tsx` | Refactor con PageSection (curso + CTA Continuar) y PageSection "Módulos y lecciones". Módulos desde `data.modules` con `mod.lessons` y `mod.lessonCount`. ListRow con badge "Pendiente" / "En curso" (si `firstLessonId === l.id`). Empty states sin cambios. |
| `app/curso/lecciones/[lessonId]/page.tsx` | Checkpoint "Módulo X de Y • {module.title}" + Badge "En curso". PageSection para título y subtítulo. Footer: Anterior (SecondaryButton disabled sin prev), Siguiente (PrimaryButton disabled sin next). Loading con SurfaceCard. EmptyState cuando notFound. |
| `app/cursos/page.tsx` | Sin cambios (ya hace `redirect("/curso")`). |

---

## Prueba manual (pasos)

1. **Alumno enrolado y curso asignado (published)**  
   - Abrir `/curso` → ver título del curso, CTA "Continuar", sección "Módulos y lecciones" con SurfaceCards por módulo ("Módulo 1: …", "N lecciones") y ListRows por lección (badge Pendiente/En curso, chevron).  
   - Clic en la primera lección → `/curso/lecciones/[id]`.  
   - Comprobar checkpoint "Módulo 1 de Y • …" y Badge "En curso".  
   - "Siguiente" lleva a la siguiente lección; seguir hasta cambiar de módulo y comprobar que prev/next cruzan módulos sin 404.

2. **Sin contenido published**  
   - `/curso` con curso asignado pero sin módulos/lecciones publicados → EmptyState "El contenido se está preparando".

3. **Sin curso asignado**  
   - `/curso` con enrollment pero sin curso primary → EmptyState "Tu curso aparecerá aquí cuando esté asignado."

4. **Lección no disponible**  
   - GET `/api/curso/lecciones/id-inexistente` → 404.  
   - En UI, abrir `/curso/lecciones/id-inexistente` → EmptyState "Lección no disponible" + CTA "Volver al curso".

5. **Redirect**  
   - Abrir `/cursos` → redirige a `/curso`.

---

## Capturas (descripción)

- **/curso**: Cabecera con título del curso y botón "Continuar"; debajo, sección "Módulos y lecciones" con tarjetas por módulo; cada tarjeta muestra "Módulo N: título" y "X lecciones"; dentro, filas por lección con título, badge (Pendiente o En curso) y chevron a la derecha.
- **/curso/lecciones/[id]**: Breadcrumb "Curso · Título lección"; línea "Módulo X de Y • Nombre módulo" y badge "En curso"; título y resumen de la lección; SurfaceCard con contenido (markdown); pie con botón "Anterior" (o deshabilitado) y "Siguiente" (o deshabilitado).

---

## Criterios de aceptación (checklist)

- [x] /curso lista módulos/lecciones published ordenadas y navegables.
- [x] Abrir una lección → se ve contenido + Anterior/Siguiente funciona sin 404.
- [x] prev/next cruzan módulos correctamente.
- [x] Empty states premium (no textos secos).
- [x] UI con SurfaceCard, PageSection, ListRow, Badge, Buttons (sin estilos ad-hoc).
- [x] No loading infinito: estados loading / error / empty / success.
- [x] No progreso % ni completado real (reservado para Ticket 3).
