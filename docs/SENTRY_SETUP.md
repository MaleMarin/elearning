# Sentry — Setup en 10 minutos

## Paso 1 — Configuración ya creada

El proyecto incluye la configuración de Sentry (sin wizard). Archivos:

- `instrumentation-client.ts` — cliente (navegador)
- `sentry.server.config.ts` — servidor Node
- `sentry.edge.config.ts` — Edge
- `instrumentation.ts` — registro con Next.js
- `next.config.js` — envuelto con `withSentryConfig`
- `app/global-error.tsx` — captura errores de React

El DSN se lee de **variables de entorno** (nunca hardcodeado).

---

## Paso 2 — Variables de entorno

`.env.local` **nunca se sube al repo** (está en `.gitignore`). El archivo `.env.example` es solo el ejemplo con los **nombres** de las variables; tú pones los **valores reales** en `.env.local`.

### Dónde sacar cada valor

1. **DSN**  
   Sentry → tu proyecto → **Settings → Client Keys** → copia la URL que empieza con `https://`  
   → en `.env.local`: `NEXT_PUBLIC_SENTRY_DSN=https://...`

2. **Auth Token**  
   Sentry → **Settings** (arriba a la izquierda, a nivel de organización, no del proyecto) → **Auth Tokens** → **Create New Token** → marca el scope **project:releases**  
   → en `.env.local`: `SENTRY_AUTH_TOKEN=sntrys_...`

3. **Org y project** (para subida de source maps en build)  
   Son los slugs de la URL de Sentry (ej. `sentry.io/organizations/mi-org/projects/elearning-pd/` → `SENTRY_ORG=mi-org`, `SENTRY_PROJECT=elearning-pd`).

### Qué hacer

- Abre (o crea) `.env.local` en la raíz del proyecto.
- Pega las líneas con los valores reales (DSN y Auth Token como mínimo).
- Reinicia el servidor (`npm run dev`).

**¿Ya tienes cuenta en Sentry?** Si no: [sentry.io/signup](https://sentry.io/signup/) → crea proyecto tipo **Next.js**.

### Deploy en Vercel (obligatorio para producción)

**Sin estas variables en Vercel, Sentry no funciona en producción.** Agrégalas al hacer deploy:

- **Vercel** → tu proyecto → **Settings → Environment Variables**

| Variable | Entorno |
|----------|--------|
| `NEXT_PUBLIC_SENTRY_DSN` | Production (y Preview si quieres) |
| `SENTRY_AUTH_TOKEN`     | Production (y Preview si quieres) |

Opcionalmente también `SENTRY_ORG` y `SENTRY_PROJECT` para que el build suba source maps.

- **CI/CD:** GitHub → Settings → Secrets and variables → Actions → `SENTRY_AUTH_TOKEN`.

---

## Paso 3 — Verificar

1. Crea la ruta de prueba (ya existe): `app/api/sentry-test/route.ts`
2. Con el servidor en marcha (`npm run dev`), visita: **http://localhost:3000/api/sentry-test**
3. En unos 30 segundos debe aparecer el error en Sentry → **Issues**
4. **BORRAR** el archivo `app/api/sentry-test/route.ts` cuando hayas comprobado que llega a Sentry

---

## Paso 4 — Wrappear Firestore (opcional)

Dos helpers en `@/lib/sentry/firestore-with-sentry`:

**1) `runWithFirestoreSpan(name, fn)`** — Spans + re-lanza el error (API routes, Admin SDK).

```ts
import { runWithFirestoreSpan } from "@/lib/sentry/firestore-with-sentry";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

const data = await runWithFirestoreSpan("profiles.get", async () => {
  const db = getFirebaseAdminFirestore();
  const snap = await db.collection("profiles").doc(uid).get();
  return snap.data();
});
```

**2) `withFirestoreSentry(fn, tags, userId)` — Captura error en Sentry con tags y user, devuelve `null` (fallback sin crash).** Sirve para cliente (`getDoc`) o servidor.

```ts
import { withFirestoreSentry } from "@/lib/sentry/firestore-with-sentry";
import { getDoc } from "firebase/firestore";

const doc = await withFirestoreSentry(
  () => getDoc(ref),
  { collection: "courses" },
  userId
);
if (!doc) return; // fallback
```

---

## Tunnel y middleware

Las peticiones al DSN de Sentry pasan por la ruta **`/monitoring`** (tunnel) para evitar bloqueos por adblockers. La ruta está excluida del matcher del middleware para no exigir sesión.
