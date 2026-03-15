# Revisión: recomendaciones ADDIE, Nielsen, Mayer y Kirkpatrick

Este documento cruza las metodologías de diseño instruccional y UX con lo implementado en la plataforma e-learning (cursos tipo certificación / ciberseguridad / política digital).

---

## 1. Modelo ADDIE

| Fase | Recomendación | Estado en la plataforma |
|------|----------------|-------------------------|
| **Análisis** | Definir audiencia (ej. profesionales auditoría, riesgo, gobierno). Objetivo: aprobar certificación y aplicar marcos en el entorno laboral. | ✅ Cursos por cohorte; perfiles alumno/mentor/admin. Pendiente: documento de análisis por curso (audiencia, objetivos) en panel. |
| **Diseño** | Módulos por dominios; ruta **lineal** (un concepto depende del anterior). Microlearning 5–15 min por lección. | ✅ Estructura curso → módulos → lecciones con `order_index`; `estimated_minutes` por lección; navegación secuencial Anterior/Siguiente. |
| **Desarrollo** | Contenidos teóricos (video, PDF), casos prácticos/simulaciones, quizzes con feedback. Criterios de aprobación por módulo. | ✅ Video + Markdown por lección; recursos descargables (LessonResource). Pendiente: quizzes integrados, criterio “módulo completado solo si aprueba evaluación”, simuladores ramificados. |
| **Implementación** | Carga SCORM/PDF; criterios de aprobación; insignias/certificados por módulo; gestión por instancias/grupos (ej. 350 alumnos). | ✅ Certificados, cohortes, inscripción. Pendiente: insignias por módulo, aprobación por puntaje mínimo en evaluación, segmentación por estado/departamento. |
| **Evaluación** | Kirkpatrick: reacción, aprendizaje, comportamiento, resultados/ROI. | Pendiente: encuestas post-módulo (reacción); métricas de aciertos en simulacros (aprendizaje); seguimiento aplicación en trabajo (comportamiento/ROI). |

---

## 2. Heurísticas de Nielsen (10)

| # | Heurística | Recomendación | Estado |
|---|------------|----------------|--------|
| 1 | **Visibilidad del estado del sistema** | Barra de progreso; el usuario sabe qué ha completado y qué falta. | ✅ Barra de progreso en lección y RightRail; “Lección X de Y”, “Módulo N de M”; badges Completado/Pendiente. |
| 2 | **Correspondencia con el mundo real** | Lenguaje y metáforas familiares. | ✅ Microcopy en español neutro (“Sigue a tu ritmo”, “Continuar donde quedaste”, EmptyStates guía). |
| 3 | **Control y libertad del usuario** | Deshacer/rehacer; avanzar, pausar, retroceder a su ritmo. | ✅ Navegación Anterior/Siguiente; “Marcar como pendiente” además de completada; control de progreso. |
| 4 | **Consistencia y estándares** | Mismos colores, tipografías, botones en toda la plataforma. | ✅ UI Kit único (SurfaceCard, Buttons, Badge, etc.); paleta en `globals.css` y Tailwind. |
| 5 | **Prevención de errores** | Diseño preventivo; validaciones. | ✅ EmptyStates con guía y CTA; mensajes de error humanos en login/registro. Pendiente: validación en línea en más formularios. |
| 6 | **Reconocimiento en vez de memorización** | Etiquetas claras; no exigir recordar entre pantallas. | ✅ Breadcrumb “Curso · Lección”; contexto de módulo y progreso visible; lista de lecciones siempre accesible en /curso. |
| 7 | **Flexibilidad y eficiencia** | Atajos y opciones para usuarios avanzados. | Parcial: navegación lineal clara. Pendiente: atajos de teclado, “ir a lección X” sin pasar por lista. |
| 8 | **Diseño estético y minimalista** | Simplicidad; evitar información irrelevante. | ✅ Pantallas sin ruido; una idea por lección; contenido con .reading-width y señalización (títulos, listas). |
| 9 | **Diagnóstico y corrección de errores** | Mensajes claros que ayuden a resolver problemas. | ✅ Alert/Toast con mensajes humanos; sin jerga técnica (Firebase/Supabase) en UI. |
| 10 | **Ayuda y documentación** | Soporte accesible. | ✅ Asistente (AssistantFab/Drawer); enlace a soporte. Pendiente: micro-tips contextuales en flujo (Ticket 12). |

---

## 3. Principios de Mayer (carga cognitiva)

| Principio | Recomendación | Estado |
|-----------|----------------|--------|
| **Coherencia** | Eliminar material irrelevante; priorizar lo esencial. | ✅ Contenido por lección centrado; UI Kit sin elementos decorativos innecesarios. |
| **Segmentación** | Contenido en partes manejables; usuario controla el avance (pausar/retomar). | ✅ Lecciones cortas; `estimated_minutes`; navegación Anterior/Siguiente; lista de módulos/lecciones. |
| **Redundancia** | Evitar narración + imagen + texto escrito todo a la vez. | ✅ Soporte video + texto por separado; doc DISENO_ELEARNING_MAYER recomienda no triplicar. |
| **Modalidad** | Gráficos con narración mejor que gráficos llenos de texto. | ✅ Lección permite video y Markdown; recomendación para autores en doc. |
| **Contigüidad** | Texto e imagen relacionados juntos y en simultáneo. | ✅ Título, resumen, video y cuerpo en un mismo flujo; progreso junto al contexto del módulo. |
| **Señalización** | Destacar lo esencial (títulos, viñetas, íconos). | ✅ PageSection, badges, barra de progreso, “~X min”; Markdown con encabezados y listas. |
| **Preentrenamiento** | Presentar antes nombres y características de conceptos clave. | ✅ `title` y `summary` por lección; listado en /curso con duración y contexto de módulo. |
| **Personalización** | Lenguaje cercano al cotidiano. | ✅ Mensajes tipo “Sigue a tu ritmo”, “¡Bien! Completaste esta lección”, “Tu próxima acción está abajo”. |

---

## 4. Otras recomendaciones (cursos tipo certificación)

| Tema | Recomendación | Estado |
|------|----------------|--------|
| **Ruta lineal** | Un concepto depende del anterior; secuencia clara. | ✅ Orden por `order_index`; navegación solo Anterior/Siguiente en lección. |
| **Microlearning** | Lecciones 5–15 min; una lección = una idea o habilidad. | ✅ Campo `estimated_minutes`; estructura por lecciones; doc con recomendaciones. |
| **Landing por módulo** | Página por módulo con resumen, objetivos e insignias al terminar. | Pendiente: vista “Introducción a [Módulo]” con objetivos e insignias (Ticket futuro). |
| **Quizzes / simulacros** | Banco de preguntas con feedback inmediato y explicación de respuestas. | Pendiente: entidad quiz/evaluación; feedback por pregunta; ramificaciones (redirigir a contenido si falla). |
| **Criterios de aprobación** | Módulo completado solo si se aprueba evaluación con puntaje mínimo. | Pendiente: regla “completado = aprobado con X%” por módulo/curso. |
| **Gamificación / insignias** | Insignias o certificado por módulo para motivar. | Parcial: certificado al final del curso. Pendiente: insignias por módulo. |
| **Accesibilidad y responsividad** | Escritorio, tablet, móvil; contraste; focus. | ✅ Responsive; contraste; focus visible; min 48px touch; .reading-width. |
| **Kirkpatrick** | Reacción (encuestas), aprendizaje (aciertos), comportamiento, resultados. | Pendiente: encuestas post-módulo; métricas de quizzes; seguimiento post-curso. |

---

## 5. Resumen ejecutivo

- **Implementado:** ADDIE (diseño y desarrollo base), Nielsen (1–6 y 8–9), Mayer (todos), ruta lineal, microlearning (estructura + duración), visibilidad de progreso, control del usuario, diseño limpio y accesible.
- **Pendiente (prioritario):** Quizzes con feedback; criterio de aprobación por evaluación; landing por módulo con objetivos e insignias; encuestas de reacción (Kirkpatrick); métricas de aprendizaje.

La plataforma está alineada con las recomendaciones de diseño instruccional y UX para cursos tipo certificación; los pendientes son sobre todo evaluación (quizzes, aprobación, Kirkpatrick) y gamificación (insignias por módulo).
