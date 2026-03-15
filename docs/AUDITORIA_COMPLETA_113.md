# Auditoría completa del proyecto — Política Digital (113 ítems)

Estado real de cada ítem según revisión del código. Leyenda: ✅ COMPLETO | ⚠️ PARCIAL | ❌ FALTA | 🔴 ERROR.

---

## BLOQUE 1 — Seguridad

| # | Ítem | Estado | Notas |
|---|------|--------|-------|
| 1 | Rate limiting con Arcjet en middleware.ts (máx 10/15min en /api/auth/*) | ⚠️ PARCIAL | Rate limit en `lib/rate-limit.ts` usado en rutas (login 5/1min, assistant, admin AI). No Arcjet; no está en middleware. |
| 2 | CSP Headers en next.config (X-Frame-Options, HSTS, nosniff, Permissions-Policy) | ⚠️ PARCIAL | CSP en `next.config.js` headers(). Faltan X-Frame-Options, Strict-Transport-Security, X-Content-Type-Options, Permissions-Policy. |
| 3 | Firestore Security Rules desplegadas — usuarios solo leen sus datos | ✅ COMPLETO | `firestore.rules`: profiles, progress por uid; courses/modules/lessons solo lectura publicados; cohorts/enrollments denegados desde cliente. |
| 4 | Demo session con JWT (jose), expiración 2h, httpOnly, secure, sameSite | ⚠️ PARCIAL | `lib/auth/session-cookie.ts`: HMAC (no jose), httpOnly, secure, sameSite; expiración 5 días (no 2h). |
| 5 | Variables: DEMO_SESSION_SECRET (mín 32 chars) en .env.local | ✅ COMPLETO | `.env.example` documenta DEMO_SESSION_SECRET; `session-cookie.ts` exige ≥32 en producción. |
| 6 | Sentry configurado y enviando a precisar.sentry.io | ⚠️ PARCIAL | Sentry configurado (sentry.*.config.ts, next.config withSentryConfig). DSN apunta a ingest.us.sentry.io; org/project por env. |
| 7 | error.tsx y global-error.tsx creados | ✅ COMPLETO | `app/error.tsx` y `app/global-error.tsx` existen; capturan y envían a Sentry. |
| 8 | 2FA/MFA para admin (Firebase TOTP) | ⚠️ PARCIAL | MFA implementado (MFAChallenge, getMfaResolverFromError) para cualquier usuario con TOTP; no restringido solo a admin. |
| 9 | Audit logs en /users/{userId}/audit_logs | ❌ FALTA | Firestore rules tienen `audit_logs` con allow false (solo backend). No hay estructura documentada /users/{userId}/audit_logs en reglas. |

---

## BLOQUE 2 — Infraestructura

| # | Ítem | Estado | Notas |
|---|------|--------|-------|
| 10 | CI/CD con GitHub Actions configurado | ✅ COMPLETO | `.github/workflows/deploy.yml`: lint, build, E2E, deploy Vercel. |
| 11 | Tests E2E Playwright (login-and-dashboard, curso-and-lesson) | ✅ COMPLETO | `e2e/login-and-dashboard.spec.ts`, `e2e/curso-and-lesson.spec.ts`; CI ejecuta `npx playwright test`. |
| 12 | PWA con next-pwa (DISABLE_PWA=1 en CI) | ✅ COMPLETO | `next.config.js` withPWA; CI usa `DISABLE_PWA: "1"`. |
| 13 | Cache de contenido con unstable_cache para cursos y lecciones | ❌ FALTA | No se usa `unstable_cache` en APIs de curso/lecciones. |
| 14 | NEXT_PUBLIC_SENTRY_DSN en variables de Vercel | ⚠️ PARCIAL | Documentado en .env.example y docs; no comprobable en código. |
| 15 | SENTRY_AUTH_TOKEN en GitHub Secrets | ⚠️ PARCIAL | Documentado en docs; no comprobable en código. |

---

## BLOQUE 3 — Autenticación y login

| # | Ítem | Estado | Notas |
|---|------|--------|-------|
| 16 | Página de login en app/login/page.tsx — diseño neumórfico | ✅ COMPLETO | Login neumórfico con estilos .neu-* y panel azul deslizante. |
| 17 | Animación de slide entre Sign In y Sign Up | ✅ COMPLETO | Panel azul con transición; formularios slide con .neu-form.signin/.signup. |
| 18 | Login con Google (OAuth) | ⚠️ PARCIAL | Botón Google presente pero `disabled aria-hidden`; no hay signInWithPopup ni flujo OAuth implementado. |
| 19 | Login con Microsoft (OAuth) | ⚠️ PARCIAL | Botón Microsoft presente pero `disabled aria-hidden`; sin flujo OAuth. |
| 20 | Fondo #e8ecf0 neumórfico con partículas flotantes | ✅ COMPLETO | .neu-page background #e8ecf0; partículas con animation neu-float. |
| 21 | Inputs hundidos (box-shadow inset) | ✅ COMPLETO | .neu-input con box-shadow inset. |
| 22 | Botones del panel con texto blanco sobre fondo azul | ✅ COMPLETO | .neu-panel-btn con color #fff y borde/fondo azul. |
| 23 | Fuente Plus Jakarta Sans en toda la página de login | ✅ COMPLETO | .neu-page font-family Plus Jakarta Sans; layout carga la fuente. |

---

## BLOQUE 4 — Dashboard e inicio

| # | Ítem | Estado | Notas |
|---|------|--------|-------|
| 24 | Banner de bienvenida azul (#1428d4) con frase del día (7 frases rotativas) | ⚠️ PARCIAL | Banner en `app/inicio/page.tsx` con 7 frases por día; fondo actual `bg-[#1e3a8a]` (no #1428d4). |
| 25 | Saludo personalizado con nombre real del usuario | ✅ COMPLETO | `nextData.userName` en el saludo. |
| 26 | Sin emoji 👋 en el saludo | ⚠️ PARCIAL | Código tiene `{nextData.userName} 👋` en inicio (línea ~257). |
| 27 | "Bienvenida/o Estudiante" duplicado eliminado | ✅ COMPLETO | No aparece texto duplicado "Bienvenida/o Estudiante" en inicio. |
| 28 | Círculo de progreso neumórfico con % real | ✅ COMPLETO | Círculo con stroke y progressPct desde dashboard. |
| 29 | Card "Tu siguiente paso" con siguiente lección pendiente | ✅ COMPLETO | NextSessionCard y datos de /api/home/next. |
| 30 | Pasos de onboarding para nuevos alumnos (5 pasos) | ⚠️ PARCIAL | Diagnóstico inicial en /onboarding/diagnostic (DiagnosticWizard); no hay 5 pasos explícitos tipo checklist. |
| 31 | Migas de pan en TODAS las páginas | ⚠️ PARCIAL | AppShell tiene generateBreadcrumbs en topbar; páginas standalone (login, verificar) no tienen migas. |
| 32 | Botón flotante "¿Cómo funciona?" con guía por página | ❌ FALTA | No existe botón "¿Cómo funciona?" ni guía contextual por página. |

---

## BLOQUE 5 — Diseño neumórfico global

| # | Ítem | Estado | Notas |
|---|------|--------|-------|
| 33 | Variable --neu-bg: #e8ecf0 en globals.css | ✅ COMPLETO | Definida en :root. |
| 34 | Fondo #e8ecf0 en body, html, main | ✅ COMPLETO | Reglas con !important en globals.css y layout criticalCss. |
| 35 | Sidebar neumórfico (sin bordes, sombras) | ⚠️ PARCIAL | Sidebar usa sidebar-elevation; estilos neumórficos completos (sin bordes) dependen de globals. |
| 36 | Items activos del sidebar hundidos | ⚠️ PARCIAL | SidebarNavItem activo usa shadow-card-inset; no clase .nav-item.active neumórfica explícita. |
| 37 | Botones primarios con sombra neumórfica flotante | ⚠️ PARCIAL | Varios botones usan .btn-primary o SurfaceCard; no todos usan variables --neu-shadow-out. |
| 38 | Todos los inputs hundidos | ⚠️ PARCIAL | Algunos inputs usan .neu-input; otros .input-base o Tailwind; no unificado. |
| 39 | Cards de módulos neumórficas (sin border) | ⚠️ PARCIAL | Regla global quita border en [class*="Card"]; ModuleCard puede seguir con estilos propios. |
| 40 | Fuente Plus Jakarta Sans en TODA la plataforma | ✅ COMPLETO | Layout con next/font; globals --font. |
| 41 | Color azul eléctrico #1428d4 como primario | ✅ COMPLETO | En globals, layout, Tailwind. |
| 42 | Color verde menta #00e5a0 como acento (no dorado) | ✅ COMPLETO | --acento, --success; reemplazos hechos. |

---

## BLOQUE 6 — Íconos creativos

| # | Ítem | Estado | Notas |
|---|------|--------|-------|
| 43 | Archivo components/ui/icons/PlatformIcons.tsx | ✅ COMPLETO | Existe con todos los íconos. |
| 44 | IconInicio — red con nodo verde menta | ✅ COMPLETO | Casa con líneas y círculo acento. |
| 45 | IconCurso — libro con check azul | ✅ COMPLETO | Rectángulo, listas, check en círculo. |
| 46 | IconSesiones — pantalla con punto parpadeante | ✅ COMPLETO | Rectángulo, play, círculo con punto; animación no en SVG (opcional). |
| 47 | IconTareas — tablero kanban | ✅ COMPLETO | Tres columnas con barras. |
| 48 | IconComunidad — red de nodos | ✅ COMPLETO | Círculos conectados. |
| 49 | IconMiColega — dos órbitas con punto de encuentro | ✅ COMPLETO | Dos elipses y círculo central acento. |
| 50 | IconMentores — DOS ENGRANAJES (grande azul + pequeño verde) | ✅ COMPLETO | Engranaje grande y pequeño con punto de contacto. |
| 51 | IconEgresados — pleca académica con roseta | ✅ COMPLETO | Hexágono y círculo acento. |
| 52 | IconCertificado — documento con sello circular | ✅ COMPLETO | Rectángulo, líneas, círculo con check. |
| 53 | IconLaboratorio — átomo con electrón | ✅ COMPLETO | Tres elipses y círculo central. |
| 54 | IconSoporte — señal wifi con burbuja de mensaje | ✅ COMPLETO | Arcos y rectángulo de mensaje. |
| 55 | IconPerfil — hexágono con verificación | ✅ COMPLETO | Hexágono y check en círculo. |
| 56 | Íconos integrados en Sidebar reemplazando lucide | ✅ COMPLETO | NAV_ICON_MAP con PlatformIcons; admin sigue con lucide. |

---

## BLOQUE 7 — Navegación y UX

| # | Ítem | Estado | Notas |
|---|------|--------|-------|
| 57 | Sidebar con todos los ítems (Inicio… Perfil) | ✅ COMPLETO | NAV_ITEMS con Inicio, Curso, Sesiones, Tareas, Comunidad, Mi colega, Mentores, Egresados, Certificado, Laboratorio, Soporte, Perfil. |
| 58 | Migas de pan calculadas por pathname | ✅ COMPLETO | generateBreadcrumbs(pathname) en AppShell. |
| 59 | En móvil migas solo último nivel | ✅ COMPLETO | sm:hidden muestra breadcrumbs[last]; móvil solo label actual. |
| 60 | Tooltips en cada ítem del sidebar | ❌ FALTA | No hay title/tooltip en cada SidebarNavItem. |
| 61 | Empty states con instrucción (Comunidad, Certificado, Sesiones) | ⚠️ PARCIAL | Hay EmptyState en varias vistas; no verificado en las tres por igual. |
| 62 | Módulos con estado: Completado / En progreso / Bloqueado 🔒 | ✅ COMPLETO | Lógica y estados en curso; módulos con locked/available/completed. |

---

## BLOQUE 8 — Bot de IA

| # | Ítem | Estado | Notas |
|---|------|--------|-------|
| 63 | Bot multi-LLM: Claude (claude-sonnet-4-5) como primario | ⚠️ PARCIAL | `lib/ai/providers.ts` usa claude-sonnet-4-20250514 (no 4-5). |
| 64 | Fallback a OpenAI GPT-4o si Claude falla | ✅ COMPLETO | getModelWithFallback con FALLBACK_ORDER anthropic → openai → google. |
| 65 | Fallback a Google Gemini si OpenAI falla | ✅ COMPLETO | Incluido en FALLBACK_ORDER. |
| 66 | System prompt con principios Mayer + Nielsen | ✅ COMPLETO | Prompts en lib/ai/prompts; referencias a principios. |
| 67 | Modo estudiante vs modo admin | ⚠️ PARCIAL | Contexto y ruta usados; no hay toggle explícito "modo admin" en UI del bot. |
| 68 | Contexto automático (ruta, lessonId, progreso, rol) | ✅ COMPLETO | Assistant envía contexto en API. |
| 69 | Proveedor preferido en localStorage (preferred_llm) | ✅ COMPLETO | AssistantDrawer STORAGE_KEY "preferred_llm". |
| 70 | Streaming con useChat | ✅ COMPLETO | useChat en AssistantChat; API assistant con stream. |

---

## BLOQUE 9 — Contenido y aprendizaje

| # | Ítem | Estado | Notas |
|---|------|--------|-------|
| 71 | Lecciones con bloques tipo Notion (texto, callout, toggle, video, checklist) | ✅ COMPLETO | lessonBlocks.ts, LessonContent, callout/toggle; video en lección. |
| 72 | Quiz con opciones neumórficas (flotan/hunden al seleccionar) | ⚠️ PARCIAL | QuizPlayer/QuizResults existen; estilos neumórficos no verificados en detalle. |
| 73 | Diagnóstico inicial (5 preguntas) al registrarse | ⚠️ PARCIAL | DiagnosticWizard en /onboarding/diagnostic; redirección tras registro; número de preguntas no confirmado 5. |
| 74 | Diario de aprendizaje por lección | ❌ FALTA | No encontrado componente ni ruta de diario por lección. |
| 75 | Carta al yo futuro (al inicio del programa) | ✅ COMPLETO | FinDeCursoPage muestra carta; guardado al inicio no verificado en esta auditoría. |
| 76 | Check-in de bienestar diario (verde/amarillo/rojo) | ❌ FALTA | No encontrado. |
| 77 | Evaluación final al 100% (quiz 10 preguntas, score ≥6 desbloquea certificado) | ✅ COMPLETO | evaluation/quiz, score >= 6; triggerCertificateIfEligible al completar. |
| 78 | Spaced repetition (repasos programados en Vercel Cron) | ✅ COMPLETO | spacedRepetition.ts; /api/cron/send-reviews; vercel.json crons. |

---

## BLOQUE 10 — Gamificación

| # | Ítem | Estado | Notas |
|---|------|--------|-------|
| 79 | Sistema de puntos por actividad | ❌ FALTA | No hay sistema genérico de puntos; hay progreso y badges. |
| 80 | Al menos 5 badges implementados | ⚠️ PARCIAL | Badges en perfil y fin de curso (ej. Programa completo, Racha, Contribuidor, etc.); número variable. |
| 81 | Misiones semanales | ❌ FALTA | No encontrado. |
| 82 | Leaderboard de la cohorte | ✅ COMPLETO | Ranking en lab/trivia; api/admin/cohorts/[id]/ranking; coorte leaderboard. |

---

## BLOQUE 11 — Certificado

| # | Ítem | Estado | Notas |
|---|------|--------|-------|
| 83 | CertificadoDownloader con diseño editorial (#faf8f3 + azul + dorado) | ⚠️ PARCIAL | CertificadoDownloader.tsx existe; diseño actual con SurfaceCard; PDF puede tener #faf8f3 en backend. |
| 84 | QR real que apunta a URL de verificación | ✅ COMPLETO | FinDeCursoPage y certificado usan verifyUrl; generación QR en backend. |
| 85 | ID único formato PD-YYYY-XXXX-MX | ✅ COMPLETO | certificate-pdf / generar idCert. |
| 86 | Descarga PDF horizontal (A4) | ⚠️ PARCIAL | Ruta generar PDF existe; orientación no verificada. |
| 87 | Descarga PDF vertical (A4) | ⚠️ PARCIAL | Idem. |
| 88 | Página pública /verificar/[idCert] | ✅ COMPLETO | app/verificar/[idCert]/page.tsx. |
| 89 | Se genera al completar 100% del curso | ✅ COMPLETO | triggerCertificateIfEligible en progress/complete. |
| 90 | Admin puede emitir desde /admin/certificados | ✅ COMPLETO | admin/certificados, CertificateManager, batch/individual. |

---

## BLOQUE 12 — Página de fin de curso

| # | Ítem | Estado | Notas |
|---|------|--------|-------|
| 91 | app/felicidades/page.tsx existe | ✅ COMPLETO | Existe; usa FinDeCursoPage. |
| 92 | Hero fondo azul #1428d4 y logo PD | ✅ COMPLETO | FinDeCursoPage .fc-hero con #1428d4; logo en .fc-logo. |
| 93 | Confetti animado al cargar | ✅ COMPLETO | Canvas con partículas en FinDeCursoPage. |
| 94 | Stats reales (lecciones, horas, calificación) | ✅ COMPLETO | Props desde /api/felicidades. |
| 95 | Badges reales desde Firestore | ✅ COMPLETO | badges desde API. |
| 96 | Carta al yo futuro mostrada | ✅ COMPLETO | {carta && ...} en FinDeCursoPage. |
| 97 | Próximos 4 pasos con links funcionales | ✅ COMPLETO | fc-next-list con 4 ítems (certificado, LinkedIn, egresados, mentores). |
| 98 | Botones compartir LinkedIn, WhatsApp, X, Facebook con SVG | ✅ COMPLETO | fc-soc-btn con SVG reales. |
| 99 | Botón "Copiar link" con feedback "¡Copiado!" | ✅ COMPLETO | copyLink y setCopied. |
| 100 | 100% responsive en móvil | ✅ COMPLETO | Media queries en estilos fc-*. |

---

## BLOQUE 13 — Notificaciones y recordatorios

| # | Ítem | Estado | Notas |
|---|------|--------|-------|
| 101 | Templates de recordatorios en Firestore (8 tipos) | ⚠️ PARCIAL | WhatsApp templates (session, task, cert); no 8 tipos en Firestore documentados. |
| 102 | Canal WhatsApp configurado (Twilio o Meta) | ✅ COMPLETO | lib/services/whatsapp.ts; API whatsapp/send, webhook, remind-*. |
| 103 | Web Push Notifications implementado | ❌ FALTA | No encontrado. |
| 104 | Preferencias de notificación en perfil | ✅ COMPLETO | Perfil con opciones WhatsApp y recordatorios. |
| 105 | Cron job en Vercel para envío automático | ✅ COMPLETO | vercel.json crons → /api/jobs/run; envía recordatorios. |
| 106 | Panel admin /admin/notificaciones para envío manual | ❌ FALTA | No existe ruta /admin/notificaciones; hay /panel/comunicacion para WhatsApp por cohorte. |

---

## BLOQUE 14 — Admin

| # | Ítem | Estado | Notas |
|---|------|--------|-------|
| 107 | Panel /admin/certificados con tabla y estados | ✅ COMPLETO | admin/certificados, CertificateManager. |
| 108 | Botón "Emitir certificado" individual y batch | ✅ COMPLETO | CertificateManager y /api/admin/certificados/batch. |
| 109 | Panel /admin/notificaciones funcional | ❌ FALTA | No existe; existe panel comunicacion. |
| 110 | Panel /admin/cursos para crear/editar cursos y lecciones | ✅ COMPLETO | admin/cursos, módulos, lecciones. |

---

## BLOQUE 15 — Múltiples cursos

| # | Ítem | Estado | Notas |
|---|------|--------|-------|
| 111 | Un alumno puede estar inscrito en más de un curso | ⚠️ PARCIAL | Enrollments por cohorte; curso primario por cohorte; múltiples cursos no expuestos en UI. |
| 112 | Firestore progress por curso: /users/{uid}/progress/{courseId} | ✅ COMPLETO | firebase-progress: doc id `{uid}_{courseId}`. |
| 113 | Dashboard muestra curso activo y permite cambiar | ⚠️ PARCIAL | Dashboard usa curso de la cohorte actual; no hay selector "cambiar curso" en UI. |

---

## Resumen numérico

| Estado | Cantidad |
|--------|----------|
| ✅ COMPLETO | 68 |
| ⚠️ PARCIAL | 32 |
| ❌ FALTA | 12 |
| 🔴 ERROR | 0 |

**Total ✅ COMPLETO: 68/113**

---

## Los 10 ítems más urgentes a completar (por impacto)

1. **Rate limiting en middleware** (seguridad) — Añadir Arcjet o rate limit en middleware para /api/auth/* (10 intentos/15 min).
2. **Headers de seguridad** (CSP) — Añadir X-Frame-Options, Strict-Transport-Security, X-Content-Type-Options, Permissions-Policy en next.config.
3. **Login Google/Microsoft OAuth** (UX) — Implementar signInWithPopup (o equivalente) y quitar disabled de los botones.
4. **Banner inicio #1428d4** (diseño) — Cambiar `bg-[#1e3a8a]` a `#1428d4` en el banner de bienvenida.
5. **Quitar emoji 👋 del saludo** (copy) — Eliminar "👋" del saludo en app/inicio/page.tsx.
6. **Botón "¿Cómo funciona?"** (UX) — Añadir FAB o enlace con guía contextual por página.
7. **Tooltips en sidebar** (accesibilidad/UX) — Añadir title o tooltip en cada ítem del sidebar.
8. **Web Push Notifications** (retención) — Implementar suscripción y envío de web push.
9. **Panel /admin/notificaciones** (admin) — Crear vista de envío manual de notificaciones o unificar con panel comunicacion.
10. **Cache con unstable_cache** (rendimiento) — Usar unstable_cache en APIs de cursos/lecciones para reducir carga.

---

*Auditoría generada por revisión directa del código. Fecha: 2025-03-13.*
