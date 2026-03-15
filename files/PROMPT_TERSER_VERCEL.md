# 🎯 PROMPT CURSOR — TERSER + DEPLOY VERCEL
# ================================================================
# INSTRUCCIÓN CRÍTICA: Lee TODO antes de escribir una línea.
# ================================================================

## PASO 1 — LEE ESTOS ARCHIVOS PRIMERO

```
1. .cursorrules
2. next.config.ts   (o next.config.js si no existe .ts)
3. package.json
4. tsconfig.json
5. .env.example
```

⛔ NO escribas código hasta confirmar. Responde "Archivos leídos ✓"

---

## CONTEXTO

Proyecto: Política Digital — Next.js 14 App Router + TypeScript
El build de producción falla con error relacionado a Terser (minificador).
Necesitamos resolverlo para poder hacer deploy en Vercel.

---

## TAREA A — RESOLVER ERROR TERSER

### El error típico es uno de estos:
```
Error: Cannot find module 'terser'
Error: terser is not a valid minifier
TypeError: Cannot read properties of undefined (reading 'minify')
```

### Solución paso a paso:

#### Opción 1 — Cambiar minificador en next.config.ts:
```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ... tu configuración existente ...
  
  // Cambiar de terser a swc (más rápido, sin dependencias extra)
  swcMinify: true,
  
  experimental: {
    // Si ya tienes experimental, solo agrega esto dentro:
    swcPlugins: [],
  },
}

export default nextConfig
```

#### Opción 2 — Si swcMinify ya está y sigue fallando:
```bash
# Ejecutar en terminal:
npm install terser --save-dev
# o
npm install @swc/core --save-dev
```

#### Opción 3 — Si falla por googleapis (error común en este proyecto):
```bash
npm install googleapis
```

### Verificar que el build pasa:
```bash
npm run build
# Debe completar sin errores
# Si hay warnings de TypeScript, son aceptables
# Si hay errores de TypeScript, hay que corregirlos
```

---

## TAREA B — PREPARAR VARIABLES DE ENTORNO PARA VERCEL

### Crear/actualizar `.env.example` con todas las variables necesarias:

```env
# ── FIREBASE ──────────────────────────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# ── SUPABASE (opcional — usa mock si están vacías) ─────────
NEXT_PUBLIC_SUPABASE_URL=https://tu_proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key

# ── OPENAI ─────────────────────────────────────────────────
OPENAI_API_KEY=sk-...

# ── ANTHROPIC (Claude) ─────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-...

# ── GOOGLE DRIVE ───────────────────────────────────────────
GOOGLE_DRIVE_PDF_FOLDER_ID=tu_folder_id
GOOGLE_APPLICATION_CREDENTIALS=./service-account-drive.json

# ── SEGURIDAD ──────────────────────────────────────────────
JWT_SECRET=cadena_aleatoria_larga_minimo_32_chars
ARCJET_KEY=tu_arcjet_key

# ── SENTRY ─────────────────────────────────────────────────
NEXT_PUBLIC_SENTRY_DSN=https://...

# ── DAILY.CO (sesiones en vivo) ────────────────────────────
DAILY_API_KEY=tu_daily_key

# ── DEMO MODE ──────────────────────────────────────────────
NEXT_PUBLIC_DEMO_MODE=false
# En producción poner false. En demo poner true.
```

### Crear `docs/DEPLOY_VERCEL.md` con instrucciones:

```markdown
# Deploy en Vercel — Política Digital

## Pasos para desplegar

### 1. Conectar repositorio
- Ir a vercel.com → New Project
- Importar el repositorio de GitHub
- Framework: Next.js (detectado automáticamente)

### 2. Configurar variables de entorno
En Vercel Dashboard → Settings → Environment Variables,
agregar TODAS las variables de .env.example con valores reales.

Variables CRÍTICAS (sin estas no funciona):
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN  
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- OPENAI_API_KEY o ANTHROPIC_API_KEY
- JWT_SECRET

### 3. Build settings
- Build Command: npm run build
- Output Directory: .next
- Install Command: npm install

### 4. Deploy
- Clic en "Deploy"
- El primer deploy tarda ~3 minutos
- URL: https://politica-digital.vercel.app (o la que asigne Vercel)

### 5. Verificar
- /inicio → Dashboard del alumno
- /admin/login → Panel de administración
- /login → Login de alumno

## Comandos útiles pre-deploy
npm run build        # Verificar que compila
tsc --noEmit         # Verificar TypeScript
npm run lint         # Verificar ESLint
```

---

## TAREA C — SCRIPT DE VERIFICACIÓN PRE-DEPLOY

### Crear `scripts/check-deploy.sh`:

```bash
#!/bin/bash
echo "🔍 Verificando proyecto para deploy..."
echo ""

echo "1. TypeScript..."
npx tsc --noEmit && echo "✅ TypeScript OK" || echo "❌ Errores TypeScript"

echo ""
echo "2. Build de producción..."
npm run build && echo "✅ Build OK" || echo "❌ Error en build"

echo ""
echo "3. Variables de entorno..."
required=("NEXT_PUBLIC_FIREBASE_API_KEY" "NEXT_PUBLIC_FIREBASE_PROJECT_ID" "OPENAI_API_KEY")
for var in "${required[@]}"; do
  if [ -z "${!var}" ]; then
    echo "⚠️  Falta: $var"
  else
    echo "✅ $var configurada"
  fi
done

echo ""
echo "✅ Verificación completa"
```

---

## ✅ CHECKLIST FINAL

- [ ] `npm run build` completa sin errores
- [ ] `tsc --noEmit` sin errores TypeScript
- [ ] Error de Terser resuelto (swcMinify o instalación)
- [ ] `.env.example` actualizado con todas las variables
- [ ] `docs/DEPLOY_VERCEL.md` creado con instrucciones
- [ ] `scripts/check-deploy.sh` creado
- [ ] `npm install googleapis` ejecutado si era necesario

Solo responde "✅ Terser y Vercel listos" cuando todo esté confirmado.
