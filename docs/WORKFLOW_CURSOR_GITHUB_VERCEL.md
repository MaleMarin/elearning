# 🔧 WORKFLOW CURSOR + GITHUB + VERCEL
# Política Digital — Guía de trabajo diario
# ================================================================

---

## 📐 CÓMO ESTÁ CONFIGURADO TU PROYECTO

```
Tu computadora (Cursor)
        ↓  git push
GitHub (MaleMarin/elearning)
        ↓  automático
Vercel (elearning2-3cbu4fblf-precisar.vercel.app)
```

**Cada vez que haces push a GitHub → Vercel hace deploy automático.**
No necesitas hacer nada en Vercel manualmente.

---

## 🗂️ LAS 3 REGLAS QUE CURSOR DEBE RECIBIR SIEMPRE

### REGLA 1 — Al TERMINAR cada tarea, Cursor hace commit automático

Agrega esto al final de CADA prompt que le des a Cursor:

```
Al terminar esta tarea y verificar que tsc --noEmit pasa sin errores,
haz commit y push con este formato exacto:

git add -A
git commit -m "feat: [descripción corta de lo que hiciste]"
git push origin main

No hagas commit si hay errores de TypeScript.
No hagas commit si el build falla.
```

---

### REGLA 2 — El .cursorrules ya tiene las reglas base

Tu archivo `.cursorrules` ya existe y Cursor lo lee automáticamente
al abrir el proyecto. Contiene:
- NUNCA "cohorte" → "grupo"
- NUNCA "badges" → "logros"
- Colores SIEMPRE style={{}} inline
- Íconos SIEMPRE SVG inline
- Design system neumórfico
- **GIT WORKFLOW** y **ARCHIVOS INTOCABLES** (commit, tsc, archivos prohibidos)

**No necesitas repetir estas reglas en cada prompt** — Cursor las lee solo.

---

### REGLA 3 — Verificación antes de cada commit

Cursor debe correr estos comandos ANTES de hacer commit:

```bash
npx tsc --noEmit                                    # 0 errores
DISABLE_PWA=1 NODE_OPTIONS=--max-old-space-size=4096 npm run build  # build exitoso
```

Si alguno falla → corregir PRIMERO, commit después.

---

## 📋 PLANTILLA DE PROMPT DIARIO

Copia esta plantilla y rellena solo la sección TAREA:

```
Lee estos archivos primero:
1. .cursorrules
2. docs/DESIGN_SYSTEM.md
3. [archivo que vas a modificar]

Reglas absolutas:
- NUNCA "cohorte" → "grupo"
- NUNCA "badges" → "logros"  
- Colores SIEMPRE style={{}} inline
- Íconos SIEMPRE SVG inline

---

TAREA:
[Describe aquí exactamente qué quieres que haga]

---

Al terminar:
1. Verifica: npx tsc --noEmit (debe dar 0 errores)
2. Haz commit:
   git add -A
   git commit -m "feat: [descripción]"
   git push origin main
3. Responde "✅ Listo y pusheado" cuando el push sea exitoso.
```

---

## 🔄 FLUJO DE TRABAJO DIARIO

```
1. Abres Cursor
2. Abres el proyecto (ya conectado a GitHub)
3. Describes la tarea en el chat de Cursor
4. Cursor implementa los cambios
5. Cursor corre tsc --noEmit
6. Cursor hace git commit + push
7. GitHub recibe el código
8. Vercel detecta el push → deploy automático (3-4 min)
9. Verificas en tu URL de Vercel que todo funciona
```

---

## ⚡ COMANDOS ÚTILES EN CURSOR TERMINAL

```bash
# Ver qué cambios hay pendientes
git status

# Ver los últimos commits
git log --oneline -10

# Si algo salió mal y quieres deshacer el último commit
git revert HEAD

# Ver en qué rama estás
git branch

# Correr la app localmente
npm run dev:3001

# Verificar TypeScript
npx tsc --noEmit

# Build de prueba
DISABLE_PWA=1 NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

---

## 🚨 REGLAS DE SEGURIDAD — NUNCA HACER

```
❌ NUNCA hacer commit con errores de TypeScript
❌ NUNCA hacer commit con el build fallando
❌ NUNCA hacer push directo a main sin verificar
❌ NUNCA compartir el token de GitHub en ningún chat
❌ NUNCA modificar: 
   - components/assistant/AssistantFab.tsx
   - components/assistant/AssistantDrawer.tsx
   - components/assistant/AssistantChat.tsx
   - app/api/assistant/route.ts
   - app/api/checkin/route.ts (el original)
   - lib/firebase/*
   - lib/supabase/*
```

---

## 🔍 CÓMO VER SI EL DEPLOY FUNCIONÓ

**Opción 1 — En GitHub:**
github.com/MaleMarin/elearning → pestaña "Actions"
Si hay un círculo verde ✅ → todo bien
Si hay un círculo rojo ❌ → hay un error en el build

**Opción 2 — En Vercel:**
vercel.com → tu proyecto → "Deployments"
El más reciente debe decir "Ready" en verde

**Opción 3 — URL directa:**
Abre: https://elearning2-3cbu4fblf-precisar.vercel.app
Si carga → deploy exitoso ✅

---

## 📌 RESUMEN EN UNA LÍNEA

> **Cursor implementa → tsc verifica → commit → push → Vercel despliega solo**
