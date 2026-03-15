# Fix crítico: sesión con cookie "precisar_session"

## Objetivo

- Al pulsar "Entrar" se crea sesión (cookie) y se redirige a `redirect` (ej. /inicio o /admin/cohortes).
- GET /api/auth/me devuelve 200 cuando hay sesión.
- Middleware protege rutas usando solo la cookie (sin fetch a /api/auth/me, sin loops).
- Login UI usa AuthCard del UI Kit y Alert en errores.

---

## Cookie única

- **Nombre:** `precisar_session`
- **Opciones:** httpOnly, path "/", sameSite "lax", secure en producción, maxAge 5 días.
- Middleware y /api/auth/me leen esta misma cookie.

---

## Endpoints

### POST /api/auth/login
- **Demo (NEXT_PUBLIC_DEMO_MODE=true):** body opcional `{ email, password }`. Acepta cualquier credencial. Firma payload demo con SESSION_SECRET y setea cookie `precisar_session`. Responde 200 `{ ok: true, user: { uid: "demo", email, role: "admin" } }`.
- **Real (Firebase):** body `{ idToken }`. Verifica idToken con Firebase Admin, crea session cookie, setea `precisar_session`. Responde 200 `{ ok: true, user: { uid, email, role } }` (role desde profiles).

### GET /api/auth/me
- Lee cookie `precisar_session`. Si no existe → 401.
- Si valor es formato demo (prefijo "demo.") → verifica firma y devuelve user demo.
- Si no → verifySessionCookie (Firebase) y devuelve user + role (profiles).

### POST /api/auth/logout
- Borra cookie `precisar_session` (maxAge 0) y responde 200.

---

## Middleware (sin loops)

- **Permitir siempre:** /login, /registro, /no-inscrito, /api/*, /_next/*, favicon.ico.
- **Rutas protegidas (app, panel, admin):** si NO hay cookie `precisar_session` → redirect a /login?redirect=<pathname>.
- **Comprobar sesión:** solo lectura de la cookie (hasSessionCookie). Para demo se valida el payload firmado; para Firebase se confía en la presencia del valor (la verificación real la hace /api/auth/me en cada request de API).
- No se hace fetch a /api/auth/me dentro del middleware.
- Con Firebase, tras permitir por cookie se sigue comprobando enrollment vía /api/enroll/status para redirigir a /no-inscrito si no inscrito.

---

## Login UI

- **app/login/page.tsx:** usa AuthCard del UI Kit (ya estaba).
- **LoginForm:** On submit:
  - **Demo:** POST /api/auth/login con `{ email, password }` (email opcional, default demo@precisar.local).
  - **Real:** signInWithEmailAndPassword (Firebase client) → idToken → POST /api/auth/login con `{ idToken }`.
- Si ok: redirect a `decodeURIComponent(redirect)` o "/inicio".
- Errores: Alert premium (variant error), no solo console.

---

## Archivos tocados

| Archivo | Cambio |
|--------|--------|
| `lib/auth/session-cookie.ts` | **Nuevo.** Constante PRECISAR_SESSION_COOKIE, getSessionCookieOptions, createDemoSessionCookie, verifyDemoSessionCookie, isDemoCookieValue (firma con SESSION_SECRET). |
| `app/api/auth/login/route.ts` | **Nuevo.** POST: demo setea cookie demo firmada; real verifica idToken, createSessionCookie, setea precisar_session. |
| `app/api/auth/me/route.ts` | Lee cookie "precisar_session"; si demo o valor demo → verifyDemoSessionCookie; si no → verifySessionCookie Firebase. |
| `app/api/auth/logout/route.ts` | **Nuevo.** POST: borra cookie precisar_session, 200. |
| `lib/firebase/auth-request.ts` | Usa PRECISAR_SESSION_COOKIE; si valor demo → verifyDemoSessionCookie; si no → verifySessionCookie. |
| `lib/supabase/middleware.ts` | Sin fetch a /api/auth/me. hasSessionCookie(request) leyendo precisar_session; getRoleFromCookie para /admin. skipAuthCheck incluye /api y favicon. Redirect a /login?redirect= si no cookie en rutas protegidas. |
| `components/auth/LoginForm.tsx` | Submit: demo → POST /api/auth/login { email, password }; real → signIn + POST /api/auth/login { idToken }. Redirect a redirect param (decodeURIComponent) o /inicio. Alert en errores. |
| `components/auth/RegisterForm.tsx` | Tras registro llama POST /api/auth/login (en lugar de firebase-session) para setear precisar_session. |
| `app/no-inscrito/page.tsx` | signedIn vía GET /api/auth/me; handleSignOut llama POST /api/auth/logout. |
| `components/layout/Sidebar.tsx` | handleSignOut llama POST /api/auth/logout y redirect /login. |
| `.env.example` | Añadido SESSION_SECRET (opcional; en prod mínimo 16 caracteres). |

---

## Pasos de prueba exactos

1. **Cookie tras login**
   - Abrir http://localhost:3000/login (con NEXT_PUBLIC_DEMO_MODE=true o con Firebase configurado).
   - En demo: escribir cualquier email/contraseña y pulsar "Entrar".
   - En real: escribir credenciales Firebase y pulsar "Entrar".
   - DevTools > Application > Cookies > localhost: debe aparecer la cookie **precisar_session**.

2. **GET /api/auth/me 200**
   - Tras haber hecho login (cookie presente), abrir en otra pestaña o con fetch: GET http://localhost:3000/api/auth/me (con credentials).
   - Debe devolver 200 y body `{ uid, email, role }`.

3. **Sin rebote a login**
   - Tras login, ir a http://localhost:3000/inicio → debe cargar el dashboard sin redirigir a /login.
   - Ir a http://localhost:3000/admin/cohortes (con usuario admin en demo) → debe cargar sin redirigir a /login.

4. **Redirect con query**
   - Sin sesión, abrir http://localhost:3000/curso → debe redirigir a /login?redirect=%2Fcurso.
   - Hacer login → debe redirigir a /curso.

5. **Logout**
   - Estando logueado, en /no-inscrito o en el sidebar pulsar "Cerrar sesión".
   - Debe ir a /login y la cookie precisar_session debe desaparecer (Application > Cookies).

6. **Errores en login**
   - En modo real, introducir contraseña incorrecta y pulsar "Entrar".
   - Debe mostrarse un Alert en la UI (ej. "Correo o contraseña incorrectos"), no solo error en consola.
