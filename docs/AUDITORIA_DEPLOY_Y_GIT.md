# Auditoría: problema de deploy Vercel y push a GitHub

**Fecha:** 16 marzo 2026  
**Proyecto:** elearningPD (repo GitHub: MaleMarin/elearning)  
**Objetivo:** Deploy en Vercel del equipo Precisar y flujo Git estable.

---

## 1. Qué está ocurriendo ahora

### 1.1 Error visible al hacer `git push`

```
remote: Invalid username or token.
Password authentication is not supported for Git operations.
fatal: Authentication failed for 'https://github.com/MaleMarin/elearning.git/'
```

**Traducción:** GitHub rechaza la autenticación porque (a) ya no acepta la contraseña de la cuenta para Git y (b) el “token” que se está usando no es válido.

### 1.2 Causa raíz del fallo de push

El `origin` del repositorio está configurado así:

```
origin  https://MaleMarin:TU_TOKEN_AQUI@github.com/MaleMarin/elearning.git
```

- **TU_TOKEN_AQUI** es un texto de ejemplo que se dejó en las instrucciones, no un token real.
- Al hacer `git push`, Git envía literalmente “TU_TOKEN_AQUI” como contraseña.
- GitHub responde “Invalid username or token” porque ese valor no es un Personal Access Token (PAT) válido.

Además, desde 2021 GitHub **no permite** usar la contraseña de la cuenta para operaciones Git por HTTPS; solo PAT o SSH.

---

## 2. Resumen de problemas y estado

| # | Problema | Causa | Estado |
|---|----------|--------|--------|
| 1 | Build falla (Terser / PWA) | Plugin PWA en build de producción | Resuelto: `DISABLE_PWA=1` en Build Command y doc |
| 2 | Build falla (módulo pptx2html) | Empaquetado de dependencia en servidor | Resuelto: `serverComponentsExternalPackages: ["pptx2html"]` en next.config.js |
| 3 | Ruta `/api/assistant/threads` no se puede pre-renderizar | Uso de `request.url` en ruta tratada como estática | Resuelto: `export const dynamic = "force-dynamic"` en threads y threads/[id]/messages |
| 4 | Edge Function "middleware" > 1 MB | Arcjet + jose en el bundle del Edge | Resuelto: Arcjet movido a `/api/auth/login`; middleware sin Arcjet |
| 5 | Edge: CompressionStream / jose no soportado | `lib/auth/session-cookie.ts` (jose) importado en código que corre en Edge | Resuelto: `lib/auth/session-cookie-edge.ts` sin jose; middleware usa solo helpers Edge-safe |
| 6 | **Push a GitHub falla** | Remote con placeholder `TU_TOKEN_AQUI` en lugar de PAT real | Pendiente: usar PAT real o SSH |

---

## 3. Qué se ha corregido en código (ya en commit local)

- **Middleware Edge:** ya no importa `jose` ni Arcjet; usa `session-cookie-edge.ts` (solo comprobación de cookie).
- **Login API:** protección Arcjet aplicada en `POST /api/auth/login`.
- **Rutas assistant:** `force-dynamic` en threads y messages.
- **Documentación:** `DEPLOY_VERCEL.md` con Build Command, variables y sección de warnings.

Commit local actual: `fdd4d94` — **fix: Edge sin jose, threads dinámicos, Arcjet en login; doc warnings**

Ese commit **no está en GitHub** porque el push falla por autenticación.

---

## 4. Warnings en build (amarillo, no bloquean)

- Sentry sin `authToken`/`project`: no sube releases ni source maps; opcional.
- Paquetes deprecados (glob, inflight, next con aviso de seguridad): recomendable actualizar dependencias y Next a versión parcheada.
- Webpack cache: mensajes de serialización; no impiden el deploy.

---

## 5. Acciones requeridas para cerrar el problema

### 5.1 Hacer que `git push` funcione

**Opción A – Token en la URL (rápido)**

1. Crear un Personal Access Token en GitHub:  
   **Settings → Developer settings → Personal access tokens → Tokens (classic)**  
   Scopes: **repo** (y **workflow** si usas GitHub Actions).
2. Sustituir el placeholder por el token real:
   ```bash
   git remote set-url origin https://MaleMarin:TU_TOKEN_REAL_AQUI@github.com/MaleMarin/elearning.git
   git push
   ```
3. Por seguridad, después del push quitar el token de la URL:
   ```bash
   git remote set-url origin https://github.com/MaleMarin/elearning.git
   ```

**Opción B – Sin token en la URL (recomendado)**

1. Quitar el placeholder del remote (ejecutar en tu máquina):
   ```bash
   git remote set-url origin https://github.com/MaleMarin/elearning.git
   ```
2. Al hacer `git push`, cuando pida contraseña, pegar el **PAT** (no la contraseña de la cuenta).
3. Opcional: usar el credential helper de macOS para guardar el token y no escribirlo cada vez.

**Opción C – SSH**

- Añadir una clave SSH a GitHub y cambiar el remote a `git@github.com:MaleMarin/elearning.git`; luego `git push` sin contraseña.

### 5.2 Tras un push exitoso

- Vercel (si el proyecto está conectado a `MaleMarin/elearning`) hará un nuevo deploy con el commit `fdd4d94`.
- Comprobar en el dashboard de Vercel que el build termina sin errores en rojo (Edge y threads ya corregidos en código).

---

## 6. Conclusión

- **Problema actual:** el push falla porque en `origin` se dejó el literal **TU_TOKEN_AQUI** en lugar de un Personal Access Token válido, y GitHub no acepta contraseña de cuenta por HTTPS.
- **Solución:** poner un PAT real en la URL (temporalmente) o usar `origin` sin credenciales y pegar el PAT cuando Git pida contraseña (o usar SSH).
- **Estado del código:** los fallos de build y Edge están resueltos en el commit local; solo falta subir ese commit a GitHub para que Vercel despliegue la versión corregida.
