# Ticket 5 — Paso a modo real (Supabase) + relieve/volumen UI

## Confirmación modo real (NEXT_PUBLIC_DEMO_MODE=false)

1. **POST /api/admin/courses**  
   Inserta en Supabase (`public.courses`: title, description, status, created_by). Los datos persisten al recargar.

2. **GET /api/admin/courses**  
   Lee desde Supabase (`public.courses`, order by created_at desc). Sin mocks.

3. **/admin/cursos**  
   Usa esos endpoints; no hay rama demo en el cliente. Con DEMO_MODE=false el backend devuelve datos reales.

4. **/curso (alumno)**  
   - Cohorte activa: `enrollments` con `status = 'active'` (más reciente).  
   - Curso asignado: `cohort_courses` (is_primary = true, o primer enlace).  
   - Solo módulos y lecciones con `status = 'published'`.

---

## Entregable: prueba manual

- [ ] **Crear curso → recargar → sigue**  
  Admin en `/admin/cursos` → Crear curso (título) → Guardar → Recargar la página → el curso sigue en la lista.

- [ ] **Asignar a cohorte → alumno ve /curso**  
  Admin asigna el curso a una cohorte (y publica curso/módulos/lecciones). Alumno con enrollment activo en esa cohorte entra en `/curso` y ve el curso con módulos y lecciones.

---

## A) UI / Look: más volumen y relieve

### Archivos modificados
- **`app/globals.css`**
  - Tokens de sombra: `--shadow-card`: `0 14px 38px rgba(31,36,48,0.08)`, `--shadow-card-hover`: `0 20px 52px rgba(31,36,48,0.10)`, `--shadow-card-inset`: `inset 0 1px 0 rgba(255,255,255,0.70)`.
  - Clase `.input-premium` para inputs (borde + sombra interior en focus).
- **`components/ui/SurfaceCard.tsx`**
  - Cards con sombra base y hover; elementos clickeables con `hover:-translate-y-px`.
- **`components/ui/Buttons.tsx`**
  - Primary/Accent: sombra más marcada, `hover:-translate-y-px`, `active:translate-y-px` (efecto press).
  - Secondary: borde + sombra, hover lift y active press.
- **`components/ui/ListRow.tsx`**
  - Filas con borde sutil, sombra base e inset; con `href`, hover con lift y sombra más fuerte.

### Resultado
La UI se percibe con más cuerpo y relieve (paper premium) en cards, botones y listas.

---

## B) Modo real Supabase

### Variables de entorno
- **`.env.example`** ya documenta `NEXT_PUBLIC_DEMO_MODE`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Regla:** `DEMO_MODE=true` → mocks; `DEMO_MODE=false` (y vars configuradas) → Supabase real persistente.
- **`lib/env.ts`**: en desarrollo, si faltan las variables de Supabase se asume modo demo (no bloquea).

### Base de datos y RLS
- **Migración:** `supabase/migrations/012_lms_ticket5_schema_rls.sql`.
- **Tablas:** `courses`, `modules`, `lessons`, `cohort_courses` (con `is_primary`).
- **RLS:** admin CRUD total; alumno solo lectura de cursos asignados a su cohorte y publicados; mentor según políticas existentes.

### Endpoints (modo real cuando `DEMO_MODE=false`)

| Método | Ruta | Uso |
|--------|------|-----|
| GET | `/api/admin/courses` | Lista cursos (Supabase, `order by created_at desc`). |
| POST | `/api/admin/courses` | Crea curso (title, description, status, created_by). |
| PATCH | `/api/admin/courses/[id]` | Actualiza curso (title, description, status). |
| GET | `/api/admin/courses/[id]` | Detalle curso. |
| GET | `/api/admin/courses/[id]/modules` | Módulos del curso. |
| POST | `/api/admin/courses/[id]/modules` | Crea módulo (title, order_index, status, description). |
| GET | `/api/admin/modules/[id]` | Detalle módulo. |
| PATCH | `/api/admin/modules/[id]` | Actualiza módulo. |
| DELETE | `/api/admin/modules/[id]` | Borra módulo. |
| GET | `/api/admin/modules/[id]/lessons` | Lecciones del módulo. |
| POST | `/api/admin/modules/[id]/lessons` | Crea lección (title, summary, content, video_embed_url, estimated_minutes, order_index, status). |
| GET | `/api/admin/lessons/[id]` | Detalle lección. |
| PATCH | `/api/admin/lessons/[id]` | Actualiza lección. |
| GET | `/api/admin/courses/[id]/cohorts` | Cohortes asignadas al curso. |
| POST | `/api/admin/courses/[id]/cohorts` | Asigna curso a cohorte (body: `{ cohortId }`, insert con `is_primary: true`). |
| DELETE | `/api/admin/courses/[id]/cohorts?cohortId=...` | Quita asignación. |
| GET | `/api/admin/cohort-courses?cohortId=...` | Cursos asignados a una cohorte. |

---

## C) UI Admin

- **`/admin/cursos`**
  - Lista cursos reales (GET `/api/admin/courses`).
  - Crear curso persiste en Supabase.
  - Por curso: botón **Publicar/Despublicar** (PATCH status) y **Editar** (enlace a detalle).
- **`/admin/cursos/[courseId]`**
  - Editar curso (título, descripción, estado).
  - Listar y crear módulos.
  - Enlace a cada módulo para editar y gestionar lecciones.
  - Asignar curso a cohorte: selector de cohorte (GET `/api/admin/cohorts`), botón asignar (POST cohorts), lista de cohortes asignadas con opción quitar.

---

## D) UI Alumno (/curso)

- **DEMO_MODE=true:** flujo actual con datos demo (módulos y lecciones de demo).
- **DEMO_MODE=false:**
  1. Cohorte activa vía `enrollments` (status = 'active').
  2. Curso asignado vía `cohort_courses` (is_primary = true).
  3. Se muestran course + modules (published) + lessons (published).
  4. CTA "Continuar" enlaza a la primera lección publicada.
- **Empty states:**
  - Sin curso asignado: "Tu curso aparecerá aquí cuando esté asignado" + Contactar soporte.
  - Curso sin contenido publicado: "El contenido se está preparando" + Volver a inicio.

---

## E) Pasos de prueba (modo real)

1. **Configurar**
   - En `.env.local`: `NEXT_PUBLIC_DEMO_MODE=false`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Aplicar migraciones: `npm run db:push` (o equivalente).

2. **Admin crea curso**
   - Iniciar sesión como admin.
   - Ir a `/admin/cursos` → Crear curso (título, descripción) → Guardar.
   - Comprobar que el curso aparece en la lista y al recargar sigue ahí.

3. **Admin publica y asigna**
   - Editar el curso → cambiar estado a "Publicado" → Guardar.
   - En "Asignar a cohorte", elegir una cohorte existente → Asignar.
   - Comprobar que la cohorte aparece como asignada.

4. **Admin crea módulo y lección**
   - En el curso, añadir módulo (título) → Guardar.
   - Entrar al módulo → Añadir lección (título, resumen, contenido, estado Publicado) → Guardar.
   - Comprobar que al recargar el módulo y la lección siguen.

5. **Alumno ve el curso**
   - Iniciar sesión con un usuario con enrollment activo en esa cohorte.
   - Ir a `/curso`.
   - Comprobar que se muestra el curso con módulos y lecciones publicadas.
   - Abrir una lección y comprobar navegación Anterior/Siguiente y "Volver al curso".

6. **UI con relieve**
   - Revisar en `/admin/cursos` y `/curso` que las cards, botones y listas tengan sombra y ligero lift en hover.

---

## Archivos tocados (resumen)

| Archivo | Cambio |
|---------|--------|
| `app/globals.css` | Tokens sombra + `.input-premium` |
| `components/ui/SurfaceCard.tsx` | Relieve y hover lift |
| `components/ui/Buttons.tsx` | Sombras y active press |
| `components/ui/ListRow.tsx` | Borde, sombra e hover lift |
| `lib/services/content.ts` | `assignCourseToCohort` con `is_primary`, `getCohortCourses` con `is_primary` |
| `app/api/admin/cohort-courses/route.ts` | **Nuevo** GET por `cohortId` |
| `app/admin/cursos/page.tsx` | Botón Publicar/Despublicar, input-premium |
| `app/curso/page.tsx` | Textos empty state |
| `docs/TICKET5_MODO_REAL_ENTREGABLE.md` | Este entregable |

SQL/RLS: sin cambios adicionales; se usa la migración `012_lms_ticket5_schema_rls.sql` existente.
