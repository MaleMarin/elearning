# 🧠 CONTEXTO MAESTRO — POLÍTICA DIGITAL
# Pega esto al inicio de cada chat nuevo en Claude o Cursor
# Última actualización: Domingo 15 Mar 2026 — 16:00h

---

## 🏗️ PROYECTO

**Nombre:** Política Digital
**Descripción:** Plataforma e-learning para servidores públicos mexicanos
**Stack:** Next.js 14 App Router + Firebase + Supabase + Tailwind + TypeScript
**Puerto dev:** localhost:3001 (o 3000 si está libre) — `npm run dev:3001`
**Estado:** ✅ Dashboard funcionando en localhost:3001/inicio

---

## ✅ LO QUE QUEDÓ FUNCIONANDO HOY (15 Mar 2026)

### Dashboard /inicio
- Layout 3 columnas: sidebar 72px + main + panel derecho 240px
- Sidebar izquierdo neumórfico con 7 íconos SVG inline
- Hero card con gradiente azul, nombre real del alumno, progreso 68%
- Stats: Lecciones 7/10, Horas 18h, Calificación 8.7, Racha 7d
- Check-in bienestar: Bien / Regular / Difícil / Excelente
- Módulo 3 lecciones: Cifrado E2E ✓, Autenticación (en curso), Zero Trust (pendiente)
- Notificaciones: Quiz disponible, Sesión en vivo, Logro cerca, Tarea pendiente
- Actividad reciente: 3 items con puntos de color
- CTA: "Continuar — Lección 2: Autenticación" + "Ir al Laboratorio de Simulación"
- Panel derecho: Perfil MA + métricas (68%, 5 logros, 8.7, 7d) + Notas + Mis Logros + Calendario Marzo 2026 + día 15 marcado
- Fecha "Dom 15 Mar 2026" en topbar
- Botón "¿Cómo funciona?" en topbar
- Security strip: AES-256 · JWT 2h TTL
- AssistantFab flotante (círculo azul abajo derecha) — YA FUNCIONA, NO tocar
- NUNCA usar la palabra "badges" — siempre "logros"

### Asistente PD
- Bot "PD" con saludo "Hola soy PD, ¿cómo estás [nombre]?"
- Neumorfismo en drawer y burbujas de chat
- Placeholder input: "¿Cómo te ayudo?"
- Google Drive como contexto (PDFs de carpeta Drive → system prompt)
- Soporte dual auth: Firebase (getAuthFromRequest) + Supabase (getUser)

### Perfil del alumno
- /mi-perfil → DashboardShell + PerfilContent (misma barra que /inicio)
- /perfil → PerfilContent sin shell
- ConditionalLayout incluye /mi-perfil en STANDALONE_PATHS

### Auth
- /api/auth/me devuelve: uid, email, role, full_name
- Demo mode: DEMO_USER_DISPLAY_NAME = "Maria Flores"
- Firebase: getAuthFromRequest(req) + Firestore profiles
- Supabase: getUser + tabla profiles (mock si faltan env vars)

---

## 📁 MAPA COMPLETO DE ARCHIVOS

### Archivos clave del dashboard:
```
app/inicio/page.tsx                     ← Dashboard principal (3 columnas neumórfico)
components/layout/ConditionalLayout.tsx ← Rutas standalone: /login, /registro, /no-inscrito, /inicio, /mi-perfil
components/dashboard/DashboardShell.tsx ← Shell reutilizable (sidebar + topbar)
components/profile/PerfilContent.tsx    ← Lógica completa del perfil del alumno
app/perfil/page.tsx                     ← Renderiza <PerfilContent />
app/mi-perfil/page.tsx                  ← DashboardShell + PerfilContent
```

### Asistente PD:
```
components/assistant/AssistantDrawer.tsx ← Panel lateral chat (neumórfico, tabs Tutor/Soporte/Comunidad)
components/assistant/AssistantChat.tsx   ← Lógica mensajes, burbujas, sugerencias rápidas
components/assistant/AssistantFab.tsx    ← Botón flotante — NO TOCAR
app/api/assistant/route.ts              ← POST chat (Firebase+Supabase auth, PD system prompt, Drive, streaming)
app/api/documents/extract/route.ts      ← Extracción PDF/PPTX/TXT/audio
app/api/auth/me/route.ts               ← Devuelve uid, email, role, full_name
```

### Auth y datos:
```
lib/supabase/server.ts          ← Cliente Supabase (mock si faltan NEXT_PUBLIC_SUPABASE_URL/KEY)
lib/supabase/demo-mock.ts       ← DEMO_USER_DISPLAY_NAME = "Maria Flores"
lib/firebase/auth-request.ts    ← Auth desde cookie de sesión Firebase
lib/services/drive-pdfs.ts      ← getDrivePdfContext(folderId) — Google Drive → system prompt
```

### Google Drive:
```
lib/services/drive-pdfs.ts      ← Service Account, lista PDFs, extrae texto, caché 5min
scripts/drive-list-pdfs.js      ← CLI: node scripts/drive-list-pdfs.js <FOLDER_ID>
scripts/drive_list_pdfs.py      ← CLI: python scripts/drive_list_pdfs.py <FOLDER_ID>
scripts/README-drive-pdfs.md    ← Instrucciones Service Account
```

### Design System:
```
docs/DESIGN_SYSTEM.md           ← FUENTE DE VERDAD: colores, sombras, tipografía
docs/PROJECT_STRUCTURE.md       ← Estructura del proyecto
docs/MANUAL_ADMIN.md            ← Manual del administrador
.cursorrules                    ← Reglas para Cursor
```

---

## 🎨 DESIGN SYSTEM (NO cambiar nunca)

### Colores oficiales:
```
Fondo neumórfico:  #e8eaf0
Azul principal:    #1428d4
Azul oscuro:       #0a0f8a
Verde menta:       #00e5a0
Sombra oscura:     #c2c8d6
Sombra clara:      #ffffff
Texto primario:    #0a0f8a
Texto secundario:  #4a5580
Texto muted:       #8892b0
Verde ok:          #00b87d
```

### Sombras neumórficas exactas:
```
Elevada:           6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff
Elevada sm:        4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff
Hundida:           inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff
Hundida sm:        inset 2px 2px 5px #c2c8d6, inset -2px -2px 5px #ffffff
Sidebar izq:       5px 0 16px #c2c8d6, 1px 0 4px #ffffff
Sidebar der:      -4px 0 14px #c2c8d6, -1px 0 4px #ffffff
Hero:              7px 7px 18px rgba(10,15,138,0.35), -4px -4px 12px rgba(255,255,255,0.6)
```

### Fuentes:
```
Display/UI:    Syne — 400, 600, 700, 800
Monoespaciada: Space Mono — 400, 700
```

### Variables CSS (en DESIGN_SYSTEM.md):
```
--neu-bg, --azul, --acento, --neu-shadow-out, --neu-shadow-in
--neu-shadow-out-sm, --neu-shadow-in-sm
```

---

## 🔒 SEGURIDAD

- Rate limiting: Arcjet
- CSP Headers en next.config.ts
- Demo mode: NEXT_PUBLIC_DEMO_MODE=true
- JWT con jose (2h TTL)
- Firestore Rules desplegadas
- Cifrado E2E AES-256 en datos sensibles
- 2FA para admins
- Sentry monitoring

---

## 🚧 BRECHAS PENDIENTES (tareas del otro chat)

### Brecha 4 — Check-in cognitivo
- Evaluación adaptativa del estado mental del alumno antes de cada lección
- Ajusta la dificultad y el tipo de contenido según el resultado
- Archivo: probablemente `components/dashboard/CognitiveCheckin.tsx`
- API: `app/api/checkin/route.ts`

### Brecha 5 — Portafolio de transformación
- El alumno documenta su evolución durante el curso
- Evidencias: textos, imágenes, reflexiones por módulo
- Archivo: `app/portafolio/page.tsx` + `components/portafolio/`

### Brecha 6 — Red neuronal de conocimiento
- Mapa visual interactivo D3.js de conceptos aprendidos
- Conecta lecciones, módulos y competencias
- Archivo: `components/knowledge-graph/` + D3.js

### Brecha 7 — Offline real
- Workbox + IndexedDB para aprendizaje sin internet
- Cache de lecciones, progreso y notas offline
- Ya mencionado en el banner del dashboard ("Descargamos las próximas lecciones...")

### Brecha 8 — Retos de cohorte
- Desafíos colaborativos entre alumnos de la misma cohorte
- Leaderboard, equipos, retos semanales
- Archivo: `app/retos/page.tsx` + `components/retos/`

### Otras tareas pendientes:
- Error de build Terser (resolver antes de subir a Vercel)
- Mobile responsive (prompt-mobile-responsive.md)
- Accesibilidad WCAG (prompt-accesibilidad-wcag.md)
- 10 funcionalidades vs competencia (prompt-nuevas-funcionalidades.md)
- Variables de entorno en Vercel
- npm install googleapis (si falla el build en otro entorno)

---

## 📊 FUNCIONALIDADES IMPLEMENTADAS

### ALUMNO (98 features):
Login/registro Google+Microsoft+correo, Dashboard neumórfico 3 columnas,
Check-in bienestar, Hero card con progreso, Stats (lecciones/horas/calific/racha),
Curso módulos+lecciones bloques tipo Notion, Audio TTS OpenAI por lección,
Diario cifrado AES-256, Quiz neumórfico, Evaluación final, Carta al yo futuro,
Laboratorio acordeón 5 zonas, Simulador Política Pública Claude AI,
Portafolio transformación, Sesiones en vivo Daily.co, Comunidad/foro,
Mi colega (pares), Mentores y egresados, Certificado QR verificable,
/felicidades confetti, Perfil 6 tabs, Tareas con filtros,
Notificaciones Web Push, Offline Workbox+IndexedDB, Voz STT Whisper,
Asistente PD (chat + Drive + streaming), Mis logros (no badges),
Calendario, Notas del alumno, Panel derecho con métricas

### ADMINISTRADOR (80 features):
Dashboard métricas Firestore, Gestión cursos/módulos/lecciones,
Editor bloques, Bibliografía/podcasts/videos, Landing por módulo,
Feature flags 30+ toggles, 4 plantillas, Gestión alumnos CSV,
Cohortes múltiples, Certificados lote, Verificación QR,
Analytics xAPI Recharts, Alumnos en riesgo >5días,
Notificaciones 8 templates+WhatsApp, Learning paths,
Reglas inscripción automática, Q&A con votos, Peer review rúbricas,
SCORM+PowerPoint import, Co-autoría, Mapa conocimiento D3.js,
Learning needs, Audit logs, Manual admin, /admin/login separado

---

## ⚙️ SCRIPTS ÚTILES

```bash
npm run dev          # Puerto 3000
npm run dev:3001     # Puerto 3001 (si 3000 está ocupado)
npm install googleapis  # Si falla el build por googleapis
tsc --noEmit         # Verificar TypeScript sin errores
```

---

## 🔑 VARIABLES DE ENTORNO NECESARIAS

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=

# Supabase (opcional, usa mock si están vacías)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# OpenAI / Anthropic
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Google Drive
GOOGLE_DRIVE_PDF_FOLDER_ID=
GOOGLE_APPLICATION_CREDENTIALS=./service-account-drive.json

# Demo mode
NEXT_PUBLIC_DEMO_MODE=true
```

---

## 📌 REGLAS CRÍTICAS PARA CURSOR

1. SIEMPRE leer `.cursorrules` + `docs/DESIGN_SYSTEM.md` PRIMERO
2. Colores SIEMPRE con `style={{}}` inline — NUNCA clases Tailwind para colores
3. NUNCA usar la palabra "badges" — siempre "logros"
4. Íconos SIEMPRE SVG inline — NUNCA lucide-react ni heroicons
5. NUNCA tocar: AssistantFab.tsx, AssistantDrawer.tsx, AssistantChat.tsx
6. NUNCA tocar: lib/firebase/*, lib/supabase/*, app/api/*
7. NUNCA tocar: ConditionalLayout.tsx (a menos que se indique explícitamente)
8. SIEMPRE verificar con `tsc --noEmit` antes de decir "listo"
9. SIEMPRE usar `'use client'` en componentes con estado
10. Sombras neumórficas: SIEMPRE doble valor (luz + sombra)

---

## 🎯 PRÓXIMOS PASOS (en orden de prioridad)

1. ✅ Dashboard neumórfico V3 — COMPLETADO
2. 🔲 Brecha 4 — Check-in cognitivo
3. 🔲 Brecha 5 — Portafolio de transformación
4. 🔲 Brecha 6 — Red neuronal de conocimiento
5. 🔲 Brecha 7 — Offline real (Workbox)
6. 🔲 Brecha 8 — Retos de cohorte
7. 🔲 Error de build Terser
8. 🔲 Mobile responsive
9. 🔲 Accesibilidad WCAG
10. 🔲 Deploy a Vercel

¿Por cuál brecha empezamos?
