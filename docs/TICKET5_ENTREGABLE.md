# Ticket 5 — LMS base: cursos, módulos y lecciones (CRUD + vista estudiante)

## Resumen

Estructura Courses → Modules → Lessons con draft/published, orden (order_index), RLS por cohorte (enrollments). Admin/Mentor editan en /admin/cursos; estudiante ve solo cursos asignados a su cohorte y solo contenido publicado. Vista lección con markdown simple, video embed y navegación anterior/siguiente.

---

## 1. Modelo de datos (migración 012)

- **courses:** + description, slug (unique nullable), created_by (profiles.id). (title, status, created_at, updated_at ya existían.)
- **modules:** + description. Índice único (course_id, order_index). (order_index en lugar de "position".)
- **lessons:** content pasa a nullable. Índice único (module_id, order_index).
- **cohort_courses:** + is_primary boolean default true.
- **Helper:** `is_course_in_user_cohort(course_id)` — true si el usuario tiene enrollment activo en una cohorte que tiene ese curso en cohort_courses.

---

## 2. RLS (012)

- **courses:** Se elimina "Anyone authenticated can read courses". Admin: FOR ALL con USING + WITH CHECK. Estudiante: SELECT solo si status = 'published' y `is_course_in_user_cohort(id)`. Mentor: SELECT/UPDATE por `can_edit_course(id)`; INSERT por rol.
- **modules:** Admin FOR ALL con WITH CHECK. Mentor FOR ALL por `can_edit_course(course_id)`. Estudiante: SELECT si (published y curso en su cohorte) o puede editar.
- **lessons:** Misma idea: estudiante solo SELECT published y curso en cohorte; admin/mentor por can_edit.
- **cohort_courses:** Admin FOR ALL con WITH CHECK; mentor SELECT/INSERT/DELETE por `is_mentor_of_cohort(cohort_id)`.

---

## 3. UI Admin (/admin/cursos)

- **Lista de cursos:** `/admin/cursos` — cards con título, estado (Publicado/Borrador), botón Editar. Formulario “Crear curso” (título, descripción, estado).
- **Editor de curso:** `/admin/cursos/[courseId]` — formulario título, descripción, estado. Lista de módulos (título, estado, Editar). “Añadir módulo” (título). Sección “Asignar a cohorte”: selector de cohorte + Asignar; lista de cohortes asignadas con Quitar.
- **Editor de módulo:** `/admin/cursos/[courseId]/modulos/[moduleId]` — título, descripción, estado. Lista de lecciones; “Añadir lección” (título). Enlace Editar lección.
- **Editor de lección:** `/admin/cursos/[courseId]/modulos/[moduleId]/leccion/[lessonId]` — título, resumen, contenido (textarea Markdown), video_embed_url, estimated_minutes, estado. Guardar / Volver al módulo.

Todo con SurfaceCard, PrimaryButton, SecondaryButton, Badge, EmptyState, inputs del sistema. Acceso: solo admin (middleware /admin); mentor puede ver/editar según RLS (cursos de sus cohortes).

---

## 4. UI Estudiante

- **Lista de cursos:** `/cursos` — GET /api/courses (solo cohorte del enrollment activo, solo published). Enlaces a `/cursos/[courseId]`.
- **Vista curso:** `/cursos/[courseId]` — módulos publicados ordenados; por módulo, lecciones publicadas; enlace a `/cursos/[courseId]/leccion-[lessonId]`.
- **Vista lección:** `/cursos/[courseId]/leccion-[lessonId]` — breadcrumb (Cursos · Curso · Módulo · Lección), título, resumen, bloque de video (iframe si hay video_embed_url), contenido renderizado (markdown simple: párrafos y **negrita**), TutorWidget, botones “Anterior” / “Siguiente lección” o “Volver al curso”.

Markdown: `lib/markdown.ts` — `simpleMarkdownToHtml()` (escape HTML, ** → strong, doble salto → párrafos).

---

## 5. Integración con Dashboard (Ticket 4)

- GET /api/dashboard ya devuelve `nextLessonHref` como primera lección publicada del curso asignado a la cohorte (vía cohort_courses + modules + lessons). “Seguir con el curso” en /inicio apunta a esa URL.

---

## 6. DEMO_MODE

- /api/courses en demo devuelve demoApiData.courses. Resto de APIs admin y estudiante siguen usando Supabase en modo real; en demo el layout y navegación se mantienen.

---

## Archivos tocados / creados

| Archivo | Cambio |
|--------|--------|
| `supabase/migrations/012_lms_ticket5_schema_rls.sql` | Nuevo: columns, índices únicos, is_course_in_user_cohort, RLS courses/modules/lessons/cohort_courses. |
| `app/api/courses/route.ts` | GET: cohortId desde enrollments (active); solo cursos published. |
| `lib/services/content.ts` | createCourse(description, created_by), updateCourse(description), getModule(id), createModule(description), updateModule(description); getEditableCourses: mentor filtra por user_id en cohort_members. |
| `app/api/admin/courses/route.ts` | POST acepta description. |
| `app/api/admin/courses/[id]/route.ts` | PATCH acepta description. |
| `app/api/admin/courses/[id]/modules/route.ts` | POST acepta description. |
| `app/api/admin/modules/[id]/route.ts` | GET getModule(id); PATCH acepta description. |
| `app/admin/cursos/page.tsx` | Nuevo: lista cursos, crear curso. |
| `app/admin/cursos/[courseId]/page.tsx` | Nuevo: editar curso, módulos, asignar cohorte. |
| `app/admin/cursos/[courseId]/modulos/[moduleId]/page.tsx` | Nuevo: editar módulo, listar/añadir lecciones. |
| `app/admin/cursos/[courseId]/modulos/[moduleId]/leccion/[lessonId]/page.tsx` | Nuevo: editar lección (todos los campos). |
| `app/cursos/[courseId]/leccion-[lessonId]/page.tsx` | Rediseño: markdown, video embed, breadcrumb, anterior/siguiente. |
| `lib/markdown.ts` | Nuevo: simpleMarkdownToHtml. |
| `components/layout/Sidebar.tsx` | Enlace “Curso” a /cursos; admin: “Cursos (contenido)” → /admin/cursos, “Cohortes e invitaciones” → /admin/cohortes. |

---

## Pasos para probar (end-to-end)

1. Aplicar migración 012: `npx supabase db push` (o ejecutar el SQL en el proyecto).
2. **Admin:** Iniciar sesión como admin. Ir a /admin/cursos. Crear curso (título, descripción, estado Publicado). Editar curso y añadir módulo; editar módulo y añadir lección. En la lección: título, resumen, contenido (texto/markdown), URL de video si se desea, estado Publicado. Guardar. En “Asignar a cohorte”, elegir una cohorte y Asignar.
3. **Estudiante:** Iniciar sesión con usuario que tenga enrollment activo en esa cohorte. Ir a /cursos: debe aparecer el curso. Entrar al curso: se listan módulos y lecciones. Entrar a una lección: se ve título, resumen, contenido renderizado y video si existe; probar “Siguiente” / “Anterior” y “Volver al curso”.
4. **Inicio:** En /inicio, “Seguir con el curso” debe llevar a la primera lección publicada del curso asignado.
5. Comprobar que un usuario sin enrollment en esa cohorte no ve el curso en /cursos (API devuelve vacío por RLS/cohorte).
6. Comprobar que contenido en borrador no aparece en la vista estudiante.

No avanzar al Ticket 6 hasta validar este flujo.
