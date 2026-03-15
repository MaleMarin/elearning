# CI/CD, E2E y PWA

## 1. Pipeline CI/CD (GitHub Actions)

- **Archivo:** `.github/workflows/deploy.yml`
- **Flujo:** en cada push o PR a `main`: **Lint → Build → E2E (Playwright) → Deploy** (solo en push a `main`).
- **Preview en PRs:** Vercel genera preview URLs automáticamente si el repo está conectado a un proyecto Vercel.
- **Bloquear merge:** en GitHub → Settings → Branches → regla para `main` → marcar "Require status checks to pass" y elegir **Lint & Build** y **E2E (Playwright)**. Así ningún PR se puede mergear si falla lint, build o tests.

### Secrets en GitHub

Añadir en **Settings → Secrets and variables → Actions**:

| Secret | Uso |
|--------|-----|
| `VERCEL_TOKEN` | Token de Vercel (Account Settings → Tokens). |
| `VERCEL_ORG_ID` | ID de la organización/team en Vercel (`vercel link` o dashboard). |
| `VERCEL_PROJECT_ID` | ID del proyecto (dashboard del proyecto o `vercel link`). |
| `SENTRY_AUTH_TOKEN` | (Opcional) Si usas Sentry para deploy de source maps. |

Obtener org y project ID: `vercel link` en el repo y revisar `.vercel/project.json`, o en el dashboard de Vercel en la URL del proyecto.

---

## 2. Tests E2E (Playwright)

- **Comando:** `npm run test:e2e` (en CI se usa `npx playwright test`).
- **UI:** `npm run test:e2e:ui`.

### Tests incluidos

1. **Login y dashboard:** login con credenciales y llegada a `/inicio`.
2. **Demo mode:** login con usuario demo y acceso al dashboard.
3. **Curso:** ver listado de módulos/lecciones en `/curso`.
4. **Lección y completar:** entrar a una lección y marcar como completada.

En CI se instala solo Chromium y se arranca el servidor con `npm run start` antes de ejecutar los tests. Para ejecutar E2E en local con modo demo: `npm run build && NEXT_PUBLIC_DEMO_MODE=true npm run test:e2e` (el primer build es necesario para que el servidor de pruebas arranque).

---

## 3. PWA y modo offline

- **Paquete:** `@ducanh2912/next-pwa` (genera Service Worker en `public/` con `next build`).
- **Manifest:** `public/manifest.json` (nombre, colores, `start_url`: `/inicio`).
- **Offline:** el SW cachea assets estáticos; las lecciones ya visitadas pueden verse en modo lectura sin red.
- **Banner:** el componente `OfflineBanner` muestra *"Estás sin conexión — modo lectura activo"* y, al volver online, *"Conexión restaurada. El progreso se actualizará."* y dispara el evento `app:online`.
- **Sincronización:** la página de inicio escucha `app:online` y vuelve a pedir `/api/home/next` y `/api/dashboard` para actualizar progreso al recuperar la conexión.

### Iconos PWA

El manifest usa por ahora `favicon.ico`. Para "Añadir a la pantalla de inicio" con iconos correctos, crear:

- `public/icons/icon-192.png` (192×192)
- `public/icons/icon-512.png` (512×512)

y actualizar `public/manifest.json` con esas rutas si se desea.

### Build en CI

En CI (GitHub Actions) se usa `DISABLE_PWA=1` para evitar un fallo conocido de next-pwa con terser. El manifest, el banner offline y la sincronización al volver online siguen activos; solo se omite la generación del Service Worker. Para generar el SW en producción, quitar `DISABLE_PWA` del workflow cuando el problema esté resuelto o ejecutar el build localmente sin `DISABLE_PWA`.
