# E-learning Precisar

Plataforma e-learning con Next.js (App Router), TypeScript, Tailwind, Supabase y Vercel. Flujo profesional con dos ambientes: **STAGING** (rama `develop`) y **PROD** (rama `main`).

## Entornos

| Rama GitHub | Proyecto Vercel   | Uso                          |
|-------------|-------------------|------------------------------|
| `develop`   | elearning-staging | Pruebas y demo con seed      |
| `main`      | elearning-prod    | Producción, sin seed automático |

Toda la configuración depende **solo de variables de entorno** (nada hardcodeado).

---

## Configuración local

1. **Copiar el archivo de ejemplo**
   ```bash
   cp .env.example .env.local
   ```

2. **Modo demo (sin Supabase)**  
   Con `NEXT_PUBLIC_DEMO_MODE=true` en `.env.local`:
   - Puedes ver la plataforma **sin configurar Supabase**.
   - No se hace login real: se usa un usuario demo (datos placeholder).
   - Cursos, sesiones, tareas y comunidad muestran datos de ejemplo.
   - No se realizan llamadas a Supabase.

3. **Modo real (con Supabase)**  
   Con `NEXT_PUBLIC_DEMO_MODE=false` en `.env.local`:
   - Completa **NEXT_PUBLIC_SUPABASE_URL** y **NEXT_PUBLIC_SUPABASE_ANON_KEY** (y opcionalmente **SUPABASE_SERVICE_ROLE_KEY** para seed/APIs de servidor).
   - Si faltan estas variables, el build o el arranque fallarán con un mensaje claro indicando qué falta.

4. **Reiniciar el servidor**  
   Después de cambiar `.env.local`, reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   Las variables `NEXT_PUBLIC_*` se inyectan en el build; los cambios no se aplican en caliente.

---

## Configurar STAGING (elearning-staging)

1. En Vercel, proyecto **elearning-staging** (deploy desde `develop`).
2. Variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (Supabase del proyecto staging).
   - `APP_URL` = URL del deploy staging (ej. `https://elearning-staging.vercel.app`).
   - **`SEED_MODE=staging`** → habilita el endpoint de seed y el script.
   - **`SEED_SECRET`** = valor secreto para autorizar `POST /api/seed` (guárdalo en un gestor de secretos).
   - Opcional: `ADMIN_ID`, `MENTOR_ID`, `STUDENT_ID` (UUIDs de usuarios creados en Supabase Auth para el seed demo).
3. Ejecutar migraciones en la base staging:
   ```bash
   supabase link  # al proyecto staging
   npm run db:push
   ```
4. Ejecutar seed **una vez** (local con env de staging o desde un job):
   - **Por endpoint** (recomendado en staging):
     ```bash
     curl -X POST https://tu-staging.vercel.app/api/seed \
       -H "x-seed-secret: TU_SEED_SECRET"
     ```
   - **Por script local** (con env de staging cargado):
     ```bash
     npm run seed:staging
     ```
     Asegúrate de tener en `.env.local` las mismas `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` del proyecto staging.

El seed es **idempotente**: si ya existe el curso "Programa Demo – 4 semanas", no duplica datos.

---

## Configurar PROD (elearning-prod)

1. En Vercel, proyecto **elearning-prod** (deploy desde `main`).
2. Variables de entorno:
   - Mismas de Supabase para el proyecto de producción.
   - `APP_URL` = URL de producción.
   - **`SEED_MODE=none`** (o no definir `SEED_MODE`) → el endpoint `/api/seed` responde 404 y no se ejecuta seed.
   - No configurar `SEED_SECRET` en prod (o dejarlo vacío).
3. Migraciones en la base prod:
   ```bash
   supabase link  # al proyecto prod
   npm run db:push
   ```
4. **No** ejecutar seed en prod. La plataforma funciona vacía con empty states; si necesitas un admin inicial, crea el usuario en Auth y opcionalmente ejecuta `npm run seed:prod` con `ADMIN_ID` definido (solo asegura el perfil admin).

---

## Cómo correr seed local y en staging

- **Local** (contra tu Supabase o el de staging):
  1. Copia `.env.local.example` a `.env.local` y rellena `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (y opcionalmente `ADMIN_ID`, `MENTOR_ID`, `STUDENT_ID`).
  2. `npm run db:push` (con Supabase CLI enlazado al proyecto correcto).
  3. `npm run seed:staging` → crea el curso demo, 4 módulos, 7 lecciones, cohorte, sesiones, tareas, posts y ticket.

- **Staging (Vercel)**:
  - Una vez desplegado con `SEED_MODE=staging` y `SEED_SECRET`:
    ```bash
    curl -X POST https://elearning-staging.vercel.app/api/seed \
      -H "x-seed-secret: <SEED_SECRET>"
    ```
  - Comprobar: `GET https://elearning-staging.vercel.app/api/seed` → `seedAvailable: true` si está habilitado.

---

## Checklist de verificación (RLS, roles, no cross-cohort leaks)

- [ ] **RLS**: Todas las tablas sensibles tienen RLS activado (profiles, cohorts, cohort_members, courses, modules, lessons, sessions, tasks, community_posts, support_tickets, etc.).
- [ ] **Políticas por cohorte**: Lectura/escritura de datos (posts, tickets, sesiones, tareas) filtrada por `is_member_of_cohort` / `is_mentor_of_cohort`; admin con políticas explícitas donde aplica.
- [ ] **Sin fugas entre cohortes**: Un usuario solo ve datos de sus cohortes; no se exponen datos de otras cohortes.
- [ ] **Middleware**: Rutas `/panel/*` requieren sesión (redirect a `/login` si no hay usuario).
- [ ] **Layout panel**: Solo roles `admin` y `mentor` pueden acceder a `/panel/*`; el resto redirige a `/`.
- [ ] **Service role**: `SUPABASE_SERVICE_ROLE_KEY` solo se usa en servidor (API routes, scripts); nunca en cliente.
- [ ] **Rate limit**: El endpoint `/api/assistant` tiene rate limit básico por usuario.
- [ ] **Seed**: En prod `SEED_MODE=none`; el endpoint de seed no está disponible y no se ejecuta seed automático.

---

## Scripts npm

| Script            | Descripción                                              |
|-------------------|----------------------------------------------------------|
| `npm run dev`     | Desarrollo local                                         |
| `npm run build`   | Build de producción                                     |
| `npm run start`   | Servir build                                             |
| `npm run db:push` | Aplicar migraciones (Supabase CLI: `supabase db push`)  |
| `npm run seed:staging` | Seed demo (idempotente); requiere env de Supabase   |
| `npm run seed:prod`    | Solo datos mínimos (ej. perfil admin si `ADMIN_ID`)  |

---

## Acceso solo con inscripción (enrollment)

El acceso a la plataforma (Inicio, Curso, Sesiones, Tareas, Comunidad, Certificado, Soporte, Panel) **requiere estar inscrito** en al menos una cohorte (o ser admin).

- **Registro/login** (Supabase Auth) es independiente: el usuario puede tener cuenta y aún no tener acceso.
- Si el usuario **no tiene enrollment activo** (ninguna fila en `cohort_members` y no es admin), el middleware redirige a **`/no-inscrito`**.
- En `/no-inscrito` puede:
  1. **Ingresar código de invitación** (recomendado): `POST /api/enroll/redeem` con `{ code }` valida el código y crea la inscripción en la cohorte.
  2. **Solicitar acceso**: crea un ticket de soporte (sin cohorte) para que admin/mentor lo gestione.

**Tabla `invitations`** (migración 006): `code` (único), `cohort_id`, `max_uses`, `uses`, `expires_at`. Admin o mentor de la cohorte pueden gestionar invitaciones (RLS). El canje se hace desde la API con service role.

**RLS**: cada usuario solo ve sus propias filas en `cohort_members`; mentor/admin ven los miembros de sus cohortes.

Para crear códigos de invitación, insertar en `invitations` desde el SQL Editor de Supabase o desde un futuro panel (ej. `INSERT INTO invitations (code, cohort_id, max_uses, expires_at) VALUES ('ABC123', 'uuid-cohorte', 10, '2026-12-31')`).

---

## Rutas de admin (solo documentación)

Estas rutas **no** se muestran como tabla dentro de la app. El producto expone un dashboard en `/admin` con tarjetas que enlazan a:

| Ruta | Uso |
|------|-----|
| `/admin` | Dashboard admin: enlaces a Cursos y Cohortes |
| `/admin/cursos` | Lista de cursos, crear curso |
| `/admin/cursos/[courseId]` | Editar curso, módulos, asignar cohorte |
| `/admin/cursos/[courseId]/modulos/[moduleId]` | Editar módulo, listar/crear lecciones |
| `/admin/cursos/[courseId]/modulos/[moduleId]/leccion/[lessonId]` | Editor de lección |
| `/admin/cohortes` | Cohortes e invitaciones (solo rol admin) |

Ruta alumno: **`/curso`** (singular) — un solo curso asignado por cohorte (`cohort_courses.is_primary`). Lecciones en **`/curso/lecciones/[lessonId]`**.

---

## UI/UX

- Idioma: español neutro.
- Estética: modo claro, fondo crema cálido, cards blancas, sombras suaves.
- Accesibilidad: base 18px, botones mínimos 44px, contraste AA.
- Menú: Inicio, Curso, Sesiones en vivo, Tareas, Comunidad, Certificado, Soporte, Mi perfil.
- Bot flotante con drawer: pestañas Tutor, Soporte, Comunidad.
- Empty states en todas las vistas cuando no hay datos, con CTA por rol.

---

## Dependencias

No se usan dependencias pagas. Si `MODEL_API_KEY` no está configurada, el asistente usa respuestas mock. WhatsApp no está integrado en el flujo actual (variables opcionales en `.env`).
