# CURSOR RULES — ELEARNING PRECISAR (Firebase-only + UI Kit)

Este documento es el **contrato obligatorio** para cualquier cambio en el código.
Si una instrucción de un ticket contradice este documento, **gana este documento**.

---

## 0) Principios (reglas base)

1) **Firebase-only**: toda persistencia, auth, roles, cohortes, enrollments, cursos, módulos, lecciones, invitaciones y canjes viven en **Firebase (Auth + Firestore + Admin SDK)**.
   - Prohibido usar Supabase o mezclar soluciones.
   - Prohibido mencionar Supabase en UI.

2) **UI Kit obligatorio**: no se inventan estilos por pantalla.
   - Prohibido "div con sombra" ad-hoc.
   - Todo sale de `/components/ui` y `/components/layout`.

3) **UX premium y viva**: la plataforma debe sentirse con **volumen/relieve** (paper premium), microinteracciones sutiles y estados claros.

4) **Accesibilidad (WCAG)**: focus visible, targets grandes, navegación clara por teclado, textos simples.

5) **Nunca loading infinito**: toda pantalla que carga data debe tener los 4 estados:
   - loading / error / empty / success

---

## 1) Rutas oficiales (no inventar)

### Alumno
- `/inicio`
- `/curso`
- `/curso/lecciones/[lessonId]`
- `/sesiones`
- `/tareas`
- `/comunidad`
- `/certificado`
- `/soporte`
- `/mi-perfil`
- `/no-inscrito` (canje de invitación)
- `/login`
- `/registro`

**Redirects obligatorios**:
- `/cursos` -> `/curso`

### Admin
- `/admin/cursos`
- `/admin/cursos/[courseId]`
- `/admin/cursos/[courseId]/modulos/[moduleId]`
- `/admin/cursos/[courseId]/modulos/[moduleId]/lecciones/[lessonId]`
- `/admin/cohortes`
- `/admin/cohortes/[cohortId]/invitaciones`

**Redirects obligatorios**:
- `/admin/curso` -> `/admin/cursos`

### API
- Todas las APIs viven bajo `/api/...`
- Está prohibido confundir `/api/*` con pantallas.

---

## 2) Puerto fijo en desarrollo

- El servidor local debe correr SIEMPRE en `http://localhost:3000`.
- `package.json`:
  - `"dev": "next dev -p 3000"`
  - `"dev:any": "next dev"`

Si 3000 está ocupado:
- liberar puerto o usar `npm run dev:any`.

---

## 3) Autenticación y sesión (regla anti-loop)

### Objetivo
- `/login` debe crear sesión.
- `GET /api/auth/me` debe devolver 200 cuando hay sesión.
- Prohibido spamear 401 infinitos.

### Reglas
1) **Endpoints obligatorios**:
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET  /api/auth/me`

2) **Cookie única de sesión**:
- Cookie httpOnly: `precisar_session`
- El middleware decide acceso por **presencia/validez** de cookie.

3) **Middleware**
- Debe permitir siempre:
  - `/login`, `/registro`
  - `/api/auth/*`
  - `/_next/*`, `/favicon.ico`
- Debe redirigir a:
  - `/login?redirect=<ruta>` si no hay sesión válida.
- Prohibido hacer fetch repetido a `/api/auth/me` en middleware.
- Prohibido loops.

4) **Cliente**
- Si `/api/auth/me` devuelve 401, el cliente pasa a estado "no autenticado" y NO reintenta en loop.

---

## 4) Firestore (modelo de datos canónico)

Colecciones recomendadas (estándar):
- `profiles/{uid}`: name, email, role, createdAt
- `courses/{courseId}`: title, description, status (draft/published), createdAt, updatedAt
- `modules/{moduleId}`: courseId, title, description, status, position
- `lessons/{lessonId}`: moduleId, title, summary, content, videoUrl, status, position, estimatedMinutes
- `cohorts/{cohortId}`: name, startsAt, endsAt, createdAt
- `cohort_courses/{cohortId}_{courseId}`: cohortId, courseId, is_primary, assignedAt
- `enrollments/{uid}_{cohortId}`: uid, cohortId, status (active/pending/inactive), enrolledAt
- `invitations/{invId}`: code, cohortId, maxUses, uses, expiresAt, active, createdAt

Reglas:
- Alumno ve contenido solo si `enrollments` activo y el curso está asignado y published.
- Admin puede crear/editar.
- Mentor (si aplica) se limita por cohorte.

---

## 5) Endpoints de contenido (contrato)

### Admin
- `/api/admin/courses` (GET/POST)
- `/api/admin/courses/[id]` (GET/PATCH/DELETE)
- `/api/admin/modules/[id]` (GET/PATCH/DELETE)
- `/api/admin/modules/[id]/lessons` (GET/POST)
- `/api/admin/lessons/[id]` (GET/PATCH/DELETE)
- `/api/admin/cohorts` (GET/POST)
- `/api/admin/cohorts/[id]/invitations` (GET)
- `/api/admin/invitations/generate` (POST)
- `/api/admin/courses/[id]/cohorts` (GET/POST/DELETE) asignación

### Alumno
- `/api/curso` (GET) — curso asignado + módulos/lecciones published
- `/api/curso/lecciones/[lessonId]` (GET) — lección published + prev/next
- `/api/enroll/redeem` (POST) — canje de invitación (transacción)

Todos los endpoints deben:
- validar sesión
- validar rol si es admin/mentor
- devolver errores claros (401/403/404/500) sin silencios
- no dejar la UI en loading infinito

---

## 6) UI Kit Precisar (obligatorio)

### Regla mayor
- Cada pantalla se construye SOLO con el kit.
- Si falta un patrón, se crea como componente del kit.

Carpetas obligatorias:
- `/components/ui`
  - `SurfaceCard`
  - `Buttons` (PrimaryButton, SecondaryButton, AccentButton)
  - `Badge`
  - `ProgressBar`
  - `ProgressRing`
  - `ListRow`
  - `EmptyState`
  - `AuthCard`
  - `Toast`/`Alert`
- `/components/layout`
  - `AppShell`
  - `Sidebar`
  - `RightRail`

### Tokens globales (app/globals.css)
- Fondo global `--bg` (gris cálido claro).
- Cards `--surface` + borde `--line` + sombras paper premium.
- Radios grandes (24/20).
- Volumen:
  - shadow base: `0 14px 38px rgba(31,36,48,0.08)`
  - shadow hover: `0 20px 52px rgba(31,36,48,0.10)`
  - inset highlight: `inset 0 1px 0 rgba(255,255,255,0.70)`
- Interacciones:
  - hover lift (-1px) en cards clickeables
  - press (+1px) en botones

---

## 7) Accesibilidad y lenguaje (obligatorio)

- Focus visible (ring sutil).
- Targets táctiles mínimos 44–48px.
- Textos simples (sin tecnicismos):
  - prohibido mostrar "service account", "redirect", "Supabase" en UI.
- Mensajes humanos:
  - no "Error 401"
  - sí "Necesitas iniciar sesión" / "No tienes permisos"

---

## 8) Disciplina de tickets (trabajar sin caos)

Cada ticket debe incluir:
1) Objetivo
2) Alcance
3) Endpoints y pantallas tocadas
4) Criterios de aceptación (checklist)
5) Pasos de prueba (3–5 pasos)

Prohibido avanzar al ticket siguiente sin:
- build OK
- pruebas manuales OK
- UI consistente con el kit
- sin loops de auth
- sin loading infinito

---

## 9) Anti-regresiones

- Cada pantalla de admin debe validar rol admin.
- Cada pantalla de alumno debe validar enrollment/curso asignado.
- Cualquier redirect singular/plural debe existir.
- Si el servidor cambia de puerto, es un error de scripts: dev debe ir fijo a 3000.

FIN.
