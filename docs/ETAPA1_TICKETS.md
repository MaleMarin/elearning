# Etapa 1 — Mejoras UX/UI (ADDIE + Nielsen + Mayer)

Plataforma e-learning Política Digital. Enfoque: premium, vivo, intuitivo, inclusivo, 100% UI Kit.

---

## Resumen de cambios (Tickets 1–6 implementados)

| Ticket | Objetivo | Archivos tocados | Componentes UI Kit |
|--------|----------|------------------|--------------------|
| **1** | Sistema vivo (volumen, microinteracciones, sin negro puro) | `globals.css`, `SurfaceCard`, `ListRow`, `curso/lecciones/[lessonId]/page`, `AssistantDrawer`, `Toast` | Variables CSS, hover-lift, focus-ring, `--overlay` |
| **2** | Inicio Hero compacto y accionable | `DashboardHero`, `inicio/page` (indirecto) | SurfaceCard, ProgressBar, PrimaryButton |
| **3** | Ruta Curso + Lecciones optimizada | `curso/page`, `curso/lecciones/[lessonId]/page`, `globals.css` | SurfaceCard, ListRow, Badge, PageSection, ProgressBar, `.reading-width` |
| **4** | EmptyStates premium | `EmptyState`, `sesiones/page`, `tareas/page`, `comunidad/page` | EmptyState, SurfaceCard, PrimaryButton |
| **5** | Auth premium y mensajes humanos | `LoginForm`, `RegisterForm`, `login/page`, `Alert` | AuthCard, PrimaryButton, Alert, input-base |
| **6** | Accesibilidad (44px+, contraste, modo lectura) | `globals.css`, `Buttons`, lección (reading-width, nav) | min-h-[48px], focus-visible, .reading-width |

---

## Checklist de pruebas manuales

### Ticket 1 — Sistema vivo
- [ ] Inicio: cards con sombra “paper”; al hacer hover en una ListRow del curso, sube ligeramente y cambia la sombra.
- [ ] Ningún elemento usa negro puro (#000); overlays usan `var(--overlay)`.
- [ ] Con tab o teclado: todos los enlaces/botones muestran anillo de foco visible (primary).

### Ticket 2 — Inicio Hero
- [ ] Inicio: saludo + “Tu próxima acción está abajo” + bloque “Siguiente acción” con progreso y CTA “Continuar”.
- [ ] Si no hay lecciones: mensaje “Aún no hay lecciones publicadas…” y CTA “Ver curso”.
- [ ] Microcopy en español neutro, sin tecnicismos.

### Ticket 3 — Curso y Lecciones
- [ ] /curso: módulos en SurfaceCard; lecciones en ListRow con badge “Completado” o “Pendiente”; duración “~X min” si existe.
- [ ] /curso/lecciones/[id]: barra de progreso, “Lección X de Y”, navegación Anterior/Siguiente, “Marcar como completada”.
- [ ] Contenido de lección con ancho de lectura cómodo (max 65ch).

### Ticket 4 — EmptyStates
- [ ] Sesiones vacías: “Todavía no hay sesiones en vivo” + descripción guía + “Ir al inicio”.
- [ ] Tareas vacías: “Aún no tienes tareas asignadas” + CTA “Ver curso”.
- [ ] Comunidad vacía: mensaje según cohorte o sin cohorte; CTA “Ir a soporte” o “Abrir asistente”.
- [ ] Certificado vacío: mensaje guía + “Ver curso”.

### Ticket 5 — Auth
- [ ] Login: inputs altos (min 48px), botón “Entrar” grande; mensaje de error humano (ej. “Correo o contraseña incorrectos…”).
- [ ] Registro: mismo estándar; errores con Alert (ej. “Ese correo ya está registrado…”).
- [ ] Footer login: “Volver al inicio” lleva a /inicio.
- [ ] No aparece “Firebase”, “Supabase” ni jerga técnica en pantalla.

### Ticket 6 — Accesibilidad
- [ ] Botones y enlaces principales con área de click ≥ 44px (en práctica 48px).
- [ ] Contraste texto/fondo suficiente; focus visible en navegación por teclado.
- [ ] Lección: contenido en .reading-width; navegación con `<nav aria-label="Navegación de lección">`.

---

## Mapa de rutas (alumno)

| Ruta | Descripción |
|------|-------------|
| `/` | Redirige a `/inicio` |
| `/inicio` | Dashboard: Hero + siguiente acción + sesión/tareas/módulos |
| `/curso` | Listado de módulos y lecciones (SurfaceCard + ListRow) |
| `/curso/lecciones/[id]` | Lección: progreso, contenido, Anterior/Siguiente, marcar completada |
| `/login` | AuthCard + LoginForm |
| `/registro` | AuthCard + RegisterForm |
| `/sesiones-en-vivo` | Listado o EmptyState sesiones |
| `/tareas` | Listado o EmptyState tareas |
| `/comunidad` | Posts o EmptyState comunidad |
| `/certificado` | Certificado o EmptyState |
| `/soporte` | Soporte |
| `/no-inscrito` | Sin cohorte asignada |

---

## Tickets 7–18 (solo plan, no implementados)

### Ticket 7 — Toasts y notificaciones consistentes
- Objetivo: Usar solo Toast/Alert del UI Kit; mensajes de éxito/error humanos.
- Componentes: Toast, Alert.

### Ticket 8 — Breadcrumbs y “dónde estoy”
- Objetivo: Breadcrumbs en curso y lección (reconocimiento > memoria).
- Componentes: Crear Breadcrumb en UI Kit si no existe; usar en layout o página.

### Ticket 9 — Loading states unificados
- Objetivo: Skeletons del kit; nunca “loading infinito”; terminar en success/empty/error.
- Componentes: SurfaceCard + animación pulse (ya usado en inicio/curso).

### Ticket 10 — Validación de formularios (prevención de errores)
- Objetivo: Validación en cliente y mensajes junto al campo; no solo alert al enviar.
- Componentes: Alert, inputs con aria-invalid.

### Ticket 11 — Deshacer / control y libertad
- Objetivo: Donde aplique (ej. marcar completada), opción “Deshacer” o “Marcar como pendiente” (ya existe en lección).
- Revisar otros flujos.

### Ticket 12 — Micro-tips del asistente (ayuda en contexto)
- Objetivo: Ayuda/documentación dentro del flujo; no solo FAQ estático.
- Componentes: AssistantFab, AssistantDrawer (ya existen).

### Ticket 13 — Consistencia de páginas de listado
- Objetivo: Sesiones, tareas, comunidad con mismo patrón: PageSection + lista o EmptyState.
- Componentes: PageSection, ListRow, EmptyState.

### Ticket 14 — Perfil y preferencias
- Objetivo: Mi perfil con datos editables; preferencias de accesibilidad si aplica.
- Componentes: AuthCard/SurfaceCard, inputs, PrimaryButton.

### Ticket 15 — Certificado descargable
- Objetivo: Vista de certificado con opción de descarga; diseño premium.
- Componentes: SurfaceCard, PrimaryButton/SecondaryButton.

### Ticket 16 — Métricas e instrumentación
- Objetivo: Eventos de analytics (ya existe track()); definir eventos clave para ADDIE Evaluation.
- No UI; lib/analytics o similar.

### Ticket 17 — Pruebas de usabilidad (heurísticas)
- Objetivo: Checklist Nielsen aplicado a flujos críticos; documento de resultados.
- Entregable: doc o checklist en docs/.

### Ticket 18 — Despliegue y estabilidad
- Objetivo: Variables de entorno; build sin errores; instrucciones de despliegue.
- No cambios de UI.

---

## Cómo ver los cambios

1. **Inicio:** `npm run dev` → http://localhost:3000/inicio (o desde / que redirige).
2. **Curso:** Desde inicio, “Continuar” o menú “Curso”; revisar módulos y entrar a una lección.
3. **Lección:** Navegación Anterior/Siguiente; “Marcar como completada”; barra de progreso.
4. **Login:** http://localhost:3000/login — probar error (credenciales incorrectas) y mensaje.
5. **EmptyStates:** Sin sesiones/tareas/comunidad según datos; o forzar listas vacías en demo.

---

*Documento generado en Etapa 1. ADDIE + Nielsen + Mayer aplicados en tickets 1–6.*
