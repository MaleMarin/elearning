# Migración a Firebase

La app usa **Firebase** (Auth + Firestore) cuando `NEXT_PUBLIC_DEMO_MODE=false`.

## 1. Variables de entorno (.env.local)

```env
NEXT_PUBLIC_DEMO_MODE=false

NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## 2. Service account (API routes y middleware)

Para que login, `/api/admin/courses`, `/api/curso`, etc. funcionen en modo real:

1. Firebase Console → tu proyecto → **Configuración** (engranaje) → **Cuentas de servicio**.
2. **Generar nueva clave privada**.
3. Copia el JSON y en `.env.local` añade (en una sola línea o escapando saltos):

```env
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"ealerning",...}
```

En Vercel: Settings → Environment Variables → pega el mismo JSON en `FIREBASE_SERVICE_ACCOUNT_JSON`.

## 3. Firebase Console

- **Authentication**: activar **Correo/Contraseña**.
- **Firestore**: crear base de datos (modo producción o prueba).

Las colecciones se crean al usar la app: `profiles`, `courses`, `modules`, `lessons`, `cohorts`, `cohort_courses`, `enrollments`, `cohort_members`, `audit_logs`.

## 4. Primer admin

El primer usuario que se registre tendrá `role: "student"` en `profiles`. Para darle rol admin:

1. Firestore → colección **profiles** → documento con id = UID del usuario (lo ves en Authentication).
2. Editar el campo `role` y poner `admin`.

## 5. Flujo

- **Login**: Firebase Auth (email/password) → idToken → POST `/api/auth/firebase-session` → cookie `firebase-session`.
- **Middleware**: llama a GET `/api/auth/me` (verifica la cookie) y protege `/admin`, `/curso`, etc.
- **Cursos**: GET/POST `/api/admin/courses` leen/escriben en Firestore. El resto de rutas de admin (módulos, lecciones, cohortes) siguen usando el content service; para 100 % Firebase habría que migrar también esas rutas a `firebase-content.ts`.

## 6. Rutas migradas a Firebase (100 %)

- **Auth:** `POST /api/auth/firebase-session`, `GET /api/auth/me`.
- **Admin cursos:** `GET/POST /api/admin/courses`, `GET/PATCH /api/admin/courses/[id]`, `GET/POST /api/admin/courses/[id]/modules`, `GET/POST/DELETE /api/admin/courses/[id]/cohorts`.
- **Admin módulos/lecciones:** `GET/PATCH/DELETE /api/admin/modules/[id]`, `GET/POST /api/admin/modules/[id]/lessons`, `GET/PATCH/DELETE /api/admin/lessons/[id]`.
- **Admin cohortes:** `GET/POST /api/admin/cohorts`, `GET /api/admin/cohorts/[id]/invitations`.
- **Admin invitaciones:** `POST /api/admin/invitations/generate`.
- **Cohort-courses:** `GET /api/admin/cohort-courses?cohortId=...`.
- **Alumno:** `GET /api/curso`, `GET /api/enroll/status`, `POST /api/enroll/redeem`.

Con `NEXT_PUBLIC_DEMO_MODE=false` y Firebase configurado, todo el flujo (crear curso → módulos → lecciones → asignar a cohorte → generar invitación → alumno canjea código → ve /curso) usa solo Firestore.
