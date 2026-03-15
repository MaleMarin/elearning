# 🧠 CONTEXTO MAESTRO — POLÍTICA DIGITAL
# Última actualización: Domingo 15 Mar 2026 — 18:30h
# Estado: ✅ LISTO PARA DEPLOY A VERCEL
# Pega esto al inicio de cada chat nuevo en Claude o Cursor

---

## 🏗️ PROYECTO
- **Nombre:** Política Digital
- **Stack:** Next.js 14.2.18 + React 18.3.1 + Firebase + Supabase + Tailwind + TypeScript
- **Puerto dev:** localhost:3001 — `npm run dev:3001`
- **Build:** `NODE_OPTIONS=--max-old-space-size=4096 npm run build`
- **Estado:** ✅ TODO RESUELTO — 0 errores TypeScript — Build exitoso

---

## ✅ COMPLETADO HOY (15 Mar 2026) — 8 TAREAS RESUELTAS

### Tarea 1 — Export PDF Portafolio ✅
- `app/api/portafolio/export-pdf/route.ts` — genera PDF con portada + página por entrada
- Botón en portafolio/page.tsx con onClick real, estado `exporting`, feedback neumórfico
- `pdf-lib` ya estaba en package.json

### Tarea 2 — Cohorte → Grupo en mensajes al alumno ✅
- APIs modificadas: api/lab/trivia, api/lesson/.../answers, api/show-tell/posts, api/retos/[challengeId], api/retos/.../equipos, api/module/.../insights, api/curso/.../features, api/learning-pairs/preference
- Demo: cohortName "Grupo demo", retos "Reto de grupo demo"
- Componentes: TriviaGame, simulador, FinDeCursoPage, MentorCard, GlossaryTerm
- Root page.tsx → "Grupo 2026-A"
- Servicios: lib/services/firebase-content.ts

### Tarea 3 — Loading Skeletons ✅
- `app/loading.tsx` — skeleton 3 columnas neumórfico completo
- `app/portafolio/loading.tsx` — 3 cards
- `app/conocimiento/loading.tsx` — círculo + texto
- `app/retos/loading.tsx` — tabs + 2 cards
- `app/mi-perfil/loading.tsx` — 4 cards
- `@keyframes shimmer` en globals.css

### Tarea 4 — 2FA para admins ✅
- Ya estaba completada (TwoFactorSetup, verify-2fa, flujo en admin/login)

### Tarea 5 — Audit Log ✅
- Ya estaba completada: audit-log.ts, /api/admin/audit, app/admin/audit/page.tsx
- Integrado en login y lesson_completed

### Tarea 6 — Motor de inscripción automática ✅
- `app/api/admin/reglas/ejecutar/route.ts` — POST con x-cron-secret o sesión admin
- Lee enrollmentRules activas, devuelve { ejecutadas, timestamp, resultados }
- Botón "Ejecutar reglas ahora" en app/admin/reglas/page.tsx
- CRON_SECRET en .env.example

### Tarea 7 — ¿Hablas humano? 80 términos + 5 modos ✅
- `lib/data/hablas-humano-terms.ts` — 80 términos tech/gobierno con term, definicion, categoria
- `components/lab/GlossaryView.tsx` — lista 80 términos, filtro por categoría y búsqueda
- `app/laboratorio/hablas-humano/page.tsx` — 5 modos: DEFINIR, USAR, CLASIFICAR, COMPARAR, APLICAR

### Tarea 8 — Dashboard multi-curso admin ✅
- `components/admin/MultiCursoDashboard.tsx` — totales + tabla por curso con "Ver →"
- `app/api/admin/cursos/metricas/route.ts` — solo admin, cuenta alumnos por cohort_courses + enrollments
- Integrado `<MultiCursoDashboard />` en app/admin/page.tsx

### Bonus — Conflicto de rutas Next.js corregido ✅
- `app/api/retos/[id]/participar` → `app/api/retos/[challengeId]/participar`

---

## ✅ COMPLETADO ANTES DE HOY

### Dashboard /inicio — V3 Neumórfico completo
- Layout 3 columnas: sidebar 72px + main + panel derecho 240px
- Hero card, stats, check-in bienestar, lecciones, logros, actividad, notificaciones
- Perfil alumno panel derecho, calendario Marzo 2026, notas, ¿Cómo funciona?
- AssistantFab flotante
- NUNCA "cohorte" → "grupo" | NUNCA "badges" → "logros"

### Brechas 1-8 (todas completadas)
- ✅ B1 Cifrado E2E (AES-256, diario + carta)
- ✅ B2 Simulador Política Pública (Claude AI)
- ✅ B3 Voz STT Whisper + TTS OpenAI
- ✅ B4 Check-in cognitivo (3 niveles)
- ✅ B5 Portafolio transformación (con export PDF)
- ✅ B6 Red neuronal D3.js
- ✅ B7 Offline real (PWA + IndexedDB)
- ✅ B8 Retos de grupo

### Infraestructura completa
- ✅ Terser + swcMinify resuelto
- ✅ Mobile responsive (3 breakpoints)
- ✅ WCAG 2.1 AA
- ✅ Sentry monitoring
- ✅ CI/CD GitHub Actions
- ✅ Caché unstable_cache
- ✅ Rate limiting Arcjet
- ✅ Firestore Rules
- ✅ CSP Headers

---

## 📁 MAPA DE ARCHIVOS CLAVE

```
DASHBOARD:
app/inicio/page.tsx                        ← Dashboard 3 columnas neumórfico
app/portafolio/page.tsx                    ← Portafolio con export PDF ✅
app/conocimiento/page.tsx                  ← Red neuronal D3.js
app/retos/page.tsx                         ← Retos de grupo (4 tabs)
app/loading.tsx                            ← Skeleton global ✅ NUEVO
app/portafolio/loading.tsx                 ← ✅ NUEVO
app/conocimiento/loading.tsx               ← ✅ NUEVO
app/retos/loading.tsx                      ← ✅ NUEVO

COMPONENTES NUEVOS HOY:
components/admin/MultiCursoDashboard.tsx   ← Dashboard multi-curso ✅
lib/data/hablas-humano-terms.ts           ← 80 términos tech-gov ✅
components/cognitive/CognitiveCheckin.tsx  ← Check-in cognitivo
components/offline/OfflineBanner.tsx       ← Banner offline

APIS:
app/api/portafolio/export-pdf/route.ts     ← ✅ NUEVO — genera PDF
app/api/admin/reglas/ejecutar/route.ts     ← ✅ NUEVO — motor reglas
app/api/admin/cursos/metricas/route.ts     ← ✅ NUEVO — métricas multi-curso
app/api/checkin/cognitive/route.ts         ← Check-in cognitivo
app/api/portafolio/entradas/route.ts       ← CRUD portafolio
app/api/retos/route.ts                     ← Retos de grupo
app/api/assistant/route.ts                 ← Bot PD (NO tocar)
app/api/auth/me/route.ts                   ← uid, email, role, full_name

ADMIN:
app/admin/page.tsx                         ← Con MultiCursoDashboard integrado ✅
app/admin/reglas/page.tsx                  ← Con botón ejecutar reglas ✅
app/admin/audit/page.tsx                   ← Audit log de accesos ✅

SERVICIOS:
lib/services/audit-log.ts                  ← Registro de accesos
lib/crypto/encryption.ts                   ← AES-256
lib/services/certificate-pdf.ts            ← Certificados PDF
lib/services/drive-pdfs.ts                 ← Google Drive → system prompt
lib/offline/indexeddb.ts                   ← IndexedDB offline
lib/data/hablas-humano-terms.ts            ← 80 términos ✅ NUEVO

LABORATORIO:
app/laboratorio/hablas-humano/page.tsx     ← ✅ Con 5 modos
components/lab/GlossaryView.tsx            ← ✅ Con 80 términos + filtros

LAYOUT:
components/layout/ConditionalLayout.tsx    ← Standalone: /inicio, /portafolio, /conocimiento, /retos, /mi-perfil
components/dashboard/DashboardShell.tsx    ← Shell reutilizable
components/assistant/AssistantFab.tsx      ← NO TOCAR ❌
components/assistant/AssistantDrawer.tsx   ← NO TOCAR ❌
components/assistant/AssistantChat.tsx     ← NO TOCAR ❌
```

---

## 🎨 DESIGN SYSTEM (NO cambiar)

```
Fondo:    #e8eaf0  |  Azul:    #1428d4  |  Oscuro:  #0a0f8a
Menta:    #00e5a0  |  Sombra-: #c2c8d6  |  Sombra+: #ffffff
Texto 1:  #0a0f8a  |  Texto 2: #4a5580  |  Texto 3: #8892b0

Elevada:    6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff
Hundida:    inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff
Sidebar ←:  5px 0 16px #c2c8d6, 1px 0 4px #ffffff
Sidebar →: -4px 0 14px #c2c8d6, -1px 0 4px #ffffff

Fuentes: Syne (400,600,700,800) + Space Mono (400,700)
```

---

## 📌 REGLAS ABSOLUTAS PARA CURSOR

1. Leer `.cursorrules` + `docs/DESIGN_SYSTEM.md` PRIMERO siempre
2. NUNCA "badges" → "logros" | NUNCA "cohorte" → "grupo"
3. Colores SIEMPRE `style={{}}` inline — NUNCA clases Tailwind para colores
4. Íconos SIEMPRE SVG inline — NUNCA lucide-react
5. NUNCA tocar: AssistantFab/Drawer/Chat, api/checkin (original), api/assistant
6. NUNCA tocar: lib/firebase/*, lib/supabase/*
7. SIEMPRE `tsc --noEmit` antes de decir "listo"
8. Build: `NODE_OPTIONS=--max-old-space-size=4096 npm run build`

---

## 🚀 PRÓXIMOS PASOS (Ordenados por prioridad)

### ESTA SEMANA — Antes de lanzar:
1. 🔲 Deploy a Vercel (docs/DEPLOY_VERCEL.md listo)
2. 🔲 Configurar variables de entorno en Vercel
3. 🔲 Logout automático por inactividad (30 min)
4. 🔲 Bloqueo por 5 intentos fallidos login (Arcjet)
5. 🔲 Página /privacidad con aviso de privacidad (LFPDPPP)
6. 🔲 Botón "Eliminar mi cuenta" en perfil (derecho al olvido)
7. 🔲 Contenido real en Firebase (módulos, lecciones)
8. 🔲 1 usuario de prueba real con datos en Firestore

### PRÓXIMAS 2 SEMANAS — Mejorar experiencia:
9. 🔲 Repetición espaciada — push días 3, 7, 14 post-módulo
10. 🔲 Subtítulos automáticos Whisper en videos
11. 🔲 NPS por módulo (1 pregunta al finalizar)
12. 🔲 Micro-celebración al completar lección
13. 🔲 Predicción de fecha de finalización
14. 🔲 H5P integración básica

### POST-LANZAMIENTO:
15. 🔲 Video branching (H5P Branching Scenario)
16. 🔲 Escape room educativo por módulo
17. 🔲 Flashcards generadas por IA
18. 🔲 Búsqueda semántica (Pinecone)
19. 🔲 App nativa (React Native)

---

## ⚙️ SCRIPTS ÚTILES

```bash
npm run dev:3001                              # Desarrollo puerto 3001
NODE_OPTIONS=--max-old-space-size=4096 npm run build  # Build producción
tsc --noEmit                                  # Verificar TypeScript
bash scripts/check-deploy.sh                  # Verificar antes de deploy
```

---

## 📊 ESTADO FINAL — 15 MAR 2026

```
✅ Completo y funcionando:  ~53 ítems
⚠️ Parcial:                  ~6 ítems
❌ No implementado:           ~6 ítems (post-lanzamiento)

LISTO PARA: Deploy a Vercel + Primera prueba real
ESTIMADO:   2-3 días para tener URL pública con usuarios reales
```
