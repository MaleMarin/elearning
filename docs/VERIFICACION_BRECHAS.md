# Verificación de integración — Cinco brechas

Revisión realizada contra el chat y el código actual. Todas las brechas están integradas.

---

## Brecha 2 — Accesibilidad (obligación legal)

| Elemento | Archivo / ubicación | Estado |
|----------|---------------------|--------|
| Perfil (tipado) | `lib/services/profile.ts`: `UserProfile` con `accessibilityFontSize`, `accessibilityReduceMotion`, `accessibilityHighContrast`; `getProfile` / `updateProfile` los leen y guardan | ✅ |
| API perfil | `app/api/profile/route.ts`: PUT acepta y persiste los tres campos; GET devuelve lo que devuelve `getProfile` (incl. a11y) | ✅ |
| Contexto | `contexts/AccessibilityContext.tsx`: `AccessibilityProvider`, `useAccessibility()`, clases en `documentElement` (`a11y-font-large`, `a11y-reduce-motion`, `a11y-high-contrast`), localStorage | ✅ |
| Componente | `components/profile/AccessibilityPreferences.tsx`: formulario (tamaño texto, reducir animaciones, mayor contraste), `onSaveToProfile`, sincroniza `initial` al context | ✅ |
| CSS | `app/globals.css`: estilos para `html.a11y-font-large`, `html.a11y-reduce-motion`, `html.a11y-high-contrast` | ✅ |
| Layout | `app/layout.tsx`: app envuelta en `<AccessibilityProvider>` | ✅ |
| Página perfil | `app/perfil/page.tsx`: sección Accesibilidad con `AccessibilityPreferences`, `initial` desde `profileData`, `onSaveToProfile` → `saveProfile` con campos a11y | ✅ |

---

## Brecha 3 — Competencias SPC (diferenciador)

| Elemento | Archivo / ubicación | Estado |
|----------|---------------------|--------|
| API seed | `app/api/admin/competencias/seed/route.ts`: POST solo admin, llama a `seedDefaultCompetencias()` | ✅ |
| Servicio | `lib/services/competencias.ts`: `seedDefaultCompetencias()`, listado, evidencia por módulo, reporte PDF | ✅ |
| API listado | `app/api/admin/competencias/route.ts`: GET listado; si vacío hace seed | ✅ |
| Página admin | `app/admin/competencias/page.tsx`: listado, botón "Ejecutar seed", texto para asignar competencias en lecciones, enlace a Cursos | ✅ |
| Dashboard admin | `app/admin/page.tsx`: tarjeta "Competencias SPC" (icono Target), enlace a `/admin/competencias` | ✅ |

---

## Brecha 1 — xAPI Analytics (ROI)

| Elemento | Archivo / ubicación | Estado |
|----------|---------------------|--------|
| API xAPI | `app/api/admin/analytics/xapi/route.ts`: respuesta incluye `roi: { totalStarts, totalCompletions, uniqueLearners, completionRate }` | ✅ |
| UI analytics | `app/admin/analytics/page.tsx`: tarjeta "Resumen ROI (LRS)" con los cuatro valores cuando `d.roi` existe, tipo `RoiSummary` | ✅ |

---

## Brecha 4 — Cohorte actual para el alumno

| Elemento | Archivo / ubicación | Estado |
|----------|---------------------|--------|
| API enroll status | `app/api/enroll/status/route.ts`: devuelve `cohortName` (desde `firebaseContent.getCohort` o demo "Cohorte demo") | ✅ |
| Sidebar | `components/layout/Sidebar.tsx`: estado `cohortName`, `useEffect` que llama a `/api/enroll/status` (salvo si `role === "admin"`), muestra "Cohorte: {cohortName}" bajo "Innovación Pública" | ✅ |

---

## Brecha 5 — UGC badge "Comunidad"

| Elemento | Archivo / ubicación | Estado |
|----------|---------------------|--------|
| Backend creación | `lib/services/lessonProposals.ts`: `createLessonFromProposal` pasa `source_community: true` a `firebaseContent.createLesson` | ✅ |
| Firestore contenido | `lib/services/firebase-content.ts`: `getLesson` / `getPublishedLessons` incluyen `source_community` | ✅ |
| API curso (lista) | `app/api/curso/route.ts`: `CursoLesson` y `CursoModuleLessonItem` con `source_community`; `buildModulesWithLessons` incluye `source_community` en cada ítem; rama Firebase idem | ✅ |
| Listado curso | `app/curso/page.tsx`: en cada lección, subtítulo con "Comunidad" cuando `source_community === true` | ✅ |
| API lección (detalle) | `app/api/curso/lecciones/[lessonId]/route.ts`: `CursoLessonDetail` con `source_community`; ramas Firebase y Supabase lo devuelven | ✅ |
| Página lección | `app/curso/lecciones/[lessonId]/page.tsx`: badge "Comunidad" cuando `lesson.source_community` | ✅ |

---

## Brecha 3 (prompt-8) — Aprendizaje por voz (TTS + STT)

| Elemento | Archivo / ubicación | Estado |
|----------|---------------------|--------|
| API TTS | `app/api/voice/tts/route.ts`: POST con `text`, OpenAI TTS, devuelve audio/mpeg; auth salvo demo | ✅ |
| API STT | `app/api/voice/stt/route.ts`: POST multipart con `audio`, OpenAI Whisper (es), devuelve `{ text }` | ✅ |
| AudioPlayer (TTS) | `components/lessons/AudioPlayer.tsx`: reproduce texto de lección vía `/api/voice/tts`, neumorfismo DESIGN_SYSTEM, velocidades, persistencia posición | ✅ |
| VoiceInput (STT) | `components/ui/VoiceInput.tsx`: textarea + botón mic, graba y envía a `/api/voice/stt`, transcripción a texto; estilos neu | ✅ |
| Página lección | `app/curso/lecciones/[lessonId]/page.tsx`: sección "Aprendizaje por voz" con `AudioPlayer` (titulo + bloques/contenido); región accesible aria-label TTS+STT | ✅ |
| Diario de aprendizaje | `components/lesson/LearningJournal.tsx`: `VoiceInput` para reflexión (escribir o dictar por voz) | ✅ |

---

## Resumen

- **Brecha 2 (Accesibilidad):** integrada (perfil, API, context, componente, CSS, layout, perfil).
- **Brecha 3 (Competencias SPC):** integrada (seed, listado, admin competencias, dashboard admin).
- **Brecha 3 (prompt-8) Aprendizaje por voz:** integrada (TTS en lección, STT en reflexión; APIs voice/tts y voice/stt; DESIGN_SYSTEM).
- **Brecha 1 (xAPI ROI):** integrada (API xAPI con `roi`, analytics con tarjeta ROI).
- **Brecha 4 (Cohorte alumno):** integrada (enroll/status con `cohortName`, Sidebar mostrando cohorte).
- **Brecha 5 (UGC Comunidad):** integrada (backend, contenido, API curso/lección, UI en listado y detalle de lección).

**Fecha de verificación:** 2025-03-13 · **Aprendizaje por voz:** 2025-03-14
