# Ticket 2 — Auth, roles y acceso privado — Entregable

## Tablas creadas/modificadas

### Creadas
- **`public.enrollments`**
  - `id` (uuid, PK)
  - `user_id` (uuid, FK auth.users, UNIQUE)
  - `status` (text: `active`, `pending`, `inactive`)
  - `created_at` (timestamptz)
  - RLS: usuario puede leer su propia fila; INSERT/UPDATE/DELETE solo con service role (backend).

### Modificadas
- **`public.profiles`**: ya existía en `001_assistant_system.sql` con `id`, `email`, `full_name`, `role` (`student`|`mentor`|`admin`), `created_at`, `updated_at`. En `007` se asegura default `role = 'student'` y se añade trigger para crear perfil al registrarse.

### Trigger
- **`on_auth_user_created`**: AFTER INSERT en `auth.users` ejecuta `public.handle_new_user()` que inserta en `public.profiles` (id, email, full_name, role='student') con ON CONFLICT DO UPDATE.

---

## Rutas

### Creadas
- **`/registro`**: página de registro (AuthCard + RegisterForm). Tras registro exitoso → redirect a `/no-inscrito`.

### Modificadas
- **`/login`**: rediseño con AuthCard + LoginForm, estilo arena/cards, enlace a registro y “Volver al inicio”. Respeta `?redirect=` para volver a la ruta solicitada.
- **`/no-inscrito`**: rediseño con SurfaceCard, mensaje “Tu cuenta está lista”, código de invitación, solicitar acceso, botón a soporte y **Cerrar sesión** (signOut + redirect a `/login`). Sin sesión → mensaje y enlace a login.

### Comportamiento del middleware
- **Rutas privadas (auth + enrollment)**: `/inicio`, `/curso`, `/sesiones-en-vivo`, `/tareas`, `/comunidad`, `/certificado`, `/cursos`, `/mi-perfil`, `/soporte`.
- **Sin sesión** → redirect a `/login?redirect=...`
- **Con sesión pero sin enrollment activo** → redirect a `/no-inscrito`
- **Rutas sin comprobación de auth**: `/login`, `/registro`, `/no-inscrito`, `/auth/callback`, `/api/*`, `/_next/*`
- **DEMO_MODE**: middleware hace `NextResponse.next()` sin comprobar sesión ni enrollment.

---

## Archivos creados

| Archivo | Descripción |
|--------|-------------|
| `supabase/migrations/007_auth_enrollments_profiles.sql` | Tabla `enrollments`, trigger perfil en `auth.users`, default role en `profiles`. |
| `components/auth/AuthCard.tsx` | Card contenedora para login/registro (título, children, footer). |
| `components/auth/LoginForm.tsx` | Formulario login (email, contraseña, error, enlace a registro). |
| `components/auth/RegisterForm.tsx` | Formulario registro (nombre opcional, email, contraseña, enlace a login). |
| `components/auth/AccessGuard.tsx` | Guardia opcional cliente: comprueba sesión y/o enrollment y redirige o muestra “Comprobando acceso…”. |
| `app/registro/page.tsx` | Página de registro. |
| `docs/TICKET_2_ENTREGABLE.md` | Este entregable. |

## Archivos modificados

| Archivo | Cambio |
|--------|--------|
| `lib/supabase/middleware.ts` | Rutas privadas definidas por lista; uso de `enrollments` + `cohort_members` en lógica de acceso. |
| `app/api/enroll/status/route.ts` | Considera `enrollments.status = 'active'` además de admin y `cohort_members`. |
| `app/login/page.tsx` | Usa AuthCard + LoginForm, fondo arena, enlace a registro. |
| `app/no-inscrito/page.tsx` | Rediseño con SurfaceCard, mensaje claro, código, solicitar acceso, soporte, **Cerrar sesión**. |
| `components/layout/ConditionalLayout.tsx` | Añadido `/registro` a STANDALONE_PATHS. |
| `lib/supabase/demo-mock.ts` | Añadido `signUp` al mock del cliente para DEMO_MODE. |

---

## Cómo probar

### 1. Usuario sin login
- Abrir `/inicio` (o cualquier ruta privada) en una ventana sin sesión.
- **Esperado**: redirect a `/login?redirect=/inicio`.
- Tras iniciar sesión (con usuario que sí tenga enrollment), debe ir a `/inicio`.

### 2. Usuario con login pero sin enrollment
- Crear cuenta en `/registro` (o usar un usuario que no tenga fila en `enrollments` con `status = 'active'` ni en `cohort_members`).
- **Esperado**: tras registro, redirect a `/no-inscrito`.
- Si intentas ir a `/inicio` (o otra ruta privada), **esperado**: redirect a `/no-inscrito`.
- En `/no-inscrito`: ver mensaje “Tu cuenta está lista”, código, solicitar acceso, soporte y **Cerrar sesión**. Cerrar sesión → `/login`.

### 3. DEMO_MODE
- `NEXT_PUBLIC_DEMO_MODE=true` (o sin Supabase en dev).
- **Esperado**: middleware no redirige; `/api/enroll/status` devuelve `{ enrolled: true }`.
- Abrir `/inicio` → se ve el dashboard sin login.
- `/login` y `/registro` siguen funcionando (mock: signIn/signUp devuelven usuario demo); tras “registro” vas a `/no-inscrito`; desde ahí puedes cerrar sesión o usar la app (en demo todo está “enrolled”).

---

## Roles

- **admin**: acceso total; `/api/enroll/status` devuelve `enrolled: true` sin comprobar enrollments.
- **mentor**: igual que estudiante para acceso a app; la experiencia de mentor se extiende en tickets posteriores.
- **estudiante** (role `student` en DB): acceso si tiene enrollment activo o cohort_member.

Si no hay role en `profiles`, el default en DB es `student`. El trigger que crea el perfil asigna `role = 'student'`.
