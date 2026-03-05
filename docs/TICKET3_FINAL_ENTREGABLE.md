# Ticket 3 (Final) — Entregable end-to-end

## Resumen

Flujo completo: admin crea cohorte → genera código(s) → estudiante canjea en /no-inscrito → enrollment activo → entra a /inicio. Canje atómico vía RPC, RLS aplicada, UI con UI Kit, DEMO_MODE respetado.

---

## 1. Admin UI (/admin/cohortes)

- **Listado de cohortes:** nombre, fechas (inicio/fin), capacidad, estado (Activa/Inactiva).
- **Crear cohorte:** formulario con nombre, fechas, capacidad (0 = sin límite), checkbox Activa.
- **Por cohorte — Códigos de invitación:**
  - Botón «Generar código».
  - Campos: Usos máximos (default 1), Caduca (opcional datetime-local), Activo (checkbox).
  - Tabla: Código | Usos (uses/max_uses) | Caduca | Estado (Activo / Agotado / Expirado / Inactivo) | Copiar.
  - Botón «Copiar código» (feedback «Copiado» 2 s).
- Componentes: SurfaceCard, PageSection, PrimaryButton, SecondaryButton, Badge, EmptyState. Sin texto técnico.

---

## 2. Canje atómico

### RPC SQL (008 + 011)

- **`public.redeem_invitation(p_code TEXT, p_user_id UUID) RETURNS UUID`** (008):  
  - `SELECT ... FROM invitations WHERE code = upper(trim(p_code)) FOR UPDATE` (bloqueo fila).  
  - Valida: invitación existe, is_active, expires_at > now(), uses < max_uses.  
  - Valida: cohort is_active, capacidad (si capacity > 0, count enrollments active < capacity).  
  - `INSERT INTO enrollments ... ON CONFLICT (user_id, cohort_id) DO UPDATE SET status = 'active'`.  
  - `UPDATE invitations SET uses = uses + 1`.  
  - Todo en una transacción implícita (una función PL/pgSQL).

- **`public.redeem_invitation_json(p_code TEXT, p_user_id UUID) RETURNS JSONB`** (011):  
  - Llama a `redeem_invitation` y devuelve `{ "ok": true, "cohortId": "..." }`. En error se propaga la excepción.

### Handler POST /api/enroll/redeem

- Body: `{ code: string }`.
- Comprueba sesión (401 si no hay usuario).
- Normaliza código (trim, uppercase).
- Llama a `admin.rpc("redeem_invitation", { p_code: code, p_user_id: user.id })` (service role).
- Respuesta 200: `{ ok: true, cohortId, enrollmentStatus: "active" }`.
- Errores 400 con mensajes del RPC (código no válido, caducado, usos agotados, cohorte inactiva, capacidad máxima).
- DEMO_MODE: responde `{ ok: true, cohortId: "demo-cohort-id", enrollmentStatus: "active" }` sin llamar a Supabase.

---

## 3. GET /api/enroll/status

- Respuesta: `{ enrolled: true, cohortId?: string }` si hay enrollment activo (el más reciente por created_at); `{ enrolled: false }` si no.
- Admin: siempre `enrolled: true`.
- DEMO_MODE: `{ enrolled: true, cohortId: "demo-cohort-id" }`.

---

## 4. /no-inscrito (estudiante)

- Mensaje: «Tu cuenta está lista» + «Falta activar tu acceso. Introduce el código de invitación…».
- Input «Código de invitación», botón «Activar acceso».
- Estados: loading, success (mensaje + redirect a /inicio), error (Alert con mensaje claro).
- Botones: «Contactar soporte» (enlace a /soporte), «Cerrar sesión».
- Fondo gris cálido `#F3F2EF`.
- Sin referencias técnicas en la UI.

---

## 5. Seguridad y consistencia

- Middleware: rutas privadas exigen sesión y llaman a GET /api/enroll/status; si `enrolled !== true` redirige a /no-inscrito. /admin exige role admin.
- RLS: sin cambios que rompan; enrollments solo lectura propia (+ admin/mentor según 009/010).
- DEMO_MODE: redeem y status devuelven éxito mock; /no-inscrito permite «Activar acceso» y redirige a /inicio.

---

## Archivos tocados

| Archivo | Cambio |
|--------|--------|
| `supabase/migrations/011_redeem_invitation_json.sql` | Nuevo: RPC `redeem_invitation_json` (retorno JSON). |
| `app/api/enroll/redeem/route.ts` | Comentario sobre atomicidad vía RPC; lógica igual. |
| `app/api/admin/invitations/generate/route.ts` | Acepta `isActive` en el body. |
| `app/admin/cohortes/page.tsx` | Form generar: is_active. Tabla invitaciones: código, usos, caduca, estado (activo/agotado/expirado/inactivo), Copiar. |
| `app/no-inscrito/page.tsx` | Copy «falta activar tu acceso», fondo #F3F2EF, «Contactar soporte» y «Cerrar sesión». |

*(Las migraciones 008–010 y el handler de redeem/status ya existían; 008 contiene la RPC atómica `redeem_invitation`.)*

---

## Pasos para probar

1. **Aplicar migraciones** (incl. 011):  
   `npx supabase db push` o ejecutar SQL en el proyecto.

2. **Admin — crear cohorte**  
   - Iniciar sesión con usuario `role = admin`.  
   - Ir a `/admin/cohortes`.  
   - Crear cohorte (nombre, fechas, capacidad).  
   - Comprobar que aparece en el listado.

3. **Admin — generar código**  
   - En esa cohorte, «Generar código».  
   - Definir usos máximos, opcional caducidad, Activo.  
   - Comprobar que el código aparece en la tabla con estado «Activo» y que «Copiar» funciona.

4. **Estudiante — canje**  
   - Iniciar sesión con otro usuario (estudiante, sin enrollment).  
   - Ir a `/no-inscrito` (o a `/inicio` y ser redirigido).  
   - Pegar el código y «Activar acceso».  
   - Comprobar mensaje de éxito y redirección a `/inicio`.

5. **Errores**  
   - Código agotado (uses = max_uses): mismo código otra vez → mensaje de usos agotados.  
   - Código expirado: generar con «Caduca» en el pasado → mensaje de caducado.  
   - Capacidad: cohorte con capacity = 1, dos usuarios canjeando → el segundo recibe error de capacidad.

6. **DEMO_MODE**  
   - `NEXT_PUBLIC_DEMO_MODE=true`: en /no-inscrito, «Activar acceso» sin código real → respuesta ok mock y redirect a /inicio.

No se avanza al Ticket 4 hasta validar este flujo.
