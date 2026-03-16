# Funcionalidades del administrador y qué hace cada una

Lista de todas las secciones del panel de administración y qué debe hacer el admin en cada una. Puedes copiar esta lista.

---

## 1. Dashboard (Admin principal) — `/admin`

**Qué hace el admin aquí:**
- Ver resumen: alumnos activos, tasa de completación, NPS del programa, certificados emitidos (y tendencias).
- Ver métricas por curso (multi-curso).
- Ver **alumnos en riesgo**: sin actividad > 5 días y progreso < 30%; acción: enviar recordatorio (enlace al perfil del alumno).
- Ver **actividad reciente**: lecciones completadas, logros, certificados emitidos.
- **Configuración**: botón para cargar escenarios del simulador en Firestore (seed).
- **Acceso rápido** a: Cursos, Grupos, Importar alumnos, Certificados, Notificaciones, Analytics.

---

## 2. Cursos — `/admin/cursos`

**Qué hace el admin aquí:**
- Listar todos los cursos (título, estado).
- Crear curso nuevo (título).
- Duplicar un curso existente.
- Cambiar estado (publicar / despublicar).
- Ir a editar un curso → `/admin/cursos/[courseId]`.

**Curso individual — `/admin/cursos/[courseId]`:**
- Editar título, descripción y estado (borrador / publicado) del curso.
- Gestionar **módulos**: crear, ordenar, editar título/descripción/objetivos/etiqueta de logro, publicar.
- Asignar el curso a **grupos** (cohortes).
- Gestionar **coautores** del curso.
- Ver alertas de contenido desactualizado (stale).
- Enlaces a: Funcionalidades del curso, Módulos, Generar lecciones con IA.

**Funcionalidades del curso — `/admin/cursos/[courseId]/funcionalidades`:**
- Activar o desactivar funcionalidades por curso (certificado con QR, peer review, spaced repetition, etc.). Lo que esté desactivado no lo ve el alumno.

**Módulo — `/admin/cursos/[courseId]/modulos/[moduleId]`:**
- Editar título, descripción, orden, estado, objetivos de aprendizaje, etiqueta de logro del módulo.
- Ver y editar **lecciones** del módulo (orden, enlace a edición de lección).
- Ir a **Contenido del módulo** (bibliografía, podcasts, videos, grabación en vivo).
- Enlace a **Generar lecciones** (IA) para ese curso.

**Contenido del módulo — `/admin/cursos/.../modulos/[moduleId]/contenido`:**
- Gestionar bibliografía, podcasts, videos y grabación de sesión en vivo del módulo.

**Lección — `/admin/cursos/.../modulos/[moduleId]/leccion/[lessonId]`:**
- Editar título, resumen, contenido (bloques), video, duración, orden, estado, competencias, recursos adjuntos de la lección.

**Generar curso — `/admin/cursos/generar`:**
- Generar estructura de curso con IA (borrador).

**Generar lecciones — `/admin/cursos/[courseId]/lecciones/generar`:**
- Generar lecciones con IA para el curso.

---

## 3. Grupos (cohortes) e invitaciones — `/admin/cohortes`

**Qué hace el admin aquí:**
- Listar grupos: nombre, fechas, curso asignado, capacidad, estado, alumnos.
- **Crear grupo**: nombre, fechas inicio/fin, capacidad, curso, facilitador, máximo de alumnos, permitir autoinscripción.
- Ver **progreso por grupo** y **ranking** de alumnos.
- **Generar códigos de invitación**: por grupo, usos máximos, fecha de expiración, activo; copiar código generado.
- **Enviar notificación al grupo**: título y cuerpo del mensaje (push o canal configurado).
- Ir a **Retos del grupo** → `/admin/cohortes/[id]/retos`.

**Retos del grupo — `/admin/cohortes/[id]/retos`:**
- Listar retos del grupo.
- Crear reto nuevo: título, descripción, fechas, criterios, premio.
- Gestionar equipos y ganador.

**Nuevo reto — `/admin/cohortes/[id]/retos/nuevo`:**
- Formulario para crear un reto (titulo, descripción, fechas, etc.).

---

## 4. Alumnos — `/admin/alumnos`

**Qué hace el admin aquí:**
- Listar alumnos con filtros: por grupo, por progreso (>80%, >50%, <30%), por estado de certificado.
- Columnas: foto, nombre, institución, grupo, progreso, último acceso, estado certificado, **acciones**: ver perfil, enviar mensaje, emitir certificado.
- Botón **Importar alumnos** → `/admin/alumnos/importar`.

**Importar alumnos — `/admin/alumnos/importar`:**
- Subir CSV con columnas: nombre, email, institución, cargo.
- Revisar vista previa y ejecutar importación.
- Ver resultado: creados, errores, contraseñas temporales si aplica.

**Perfil de alumno — `/admin/alumnos/[id]`:**
- Ver perfil completo del alumno, progreso, logros, acciones: enviar recordatorio, emitir certificado, enviar mensaje.

---

## 5. Certificados — `/admin/certificados`

**Qué hace el admin aquí:**
- Seleccionar grupo.
- Listar alumnos del grupo con estado de certificado.
- Emitir certificados **manualmente** (uno a uno) o **en lote** para quienes cumplan criterios.
- Reenviar email con certificado si aplica.

---

## 6. Notificaciones — `/admin/notificaciones`

**Qué hace el admin aquí:**
- **Enviar notificación**: elegir alcance (grupo o usuario), grupo o userId, canal (push, WhatsApp, todos), plantilla (recordatorio sesión, recordatorio tarea, certificado listo, inactividad, racha, bienvenida, recordatorio módulo, recordatorio quiz).
- Ver **estadísticas**: usuarios con push activo, total usuarios, WhatsApp enviados en el mes.
- Ver **logs** de envíos (filtrar por grupo y canal).

---

## 7. Analytics — `/admin/analytics`

**Qué hace el admin aquí:**
- Ver datos xAPI (si está configurado LRS): resumen ROI (alumnos únicos, inicios, completados, tasa).
- Tasa de **completación por lección** (iniciados vs completados).
- **Abandono de video** por segundo (en qué momento se abandona más).
- **Preguntas con más errores** (para mejorar contenido o preguntas).
- Tiempo promedio por módulo.
- **Alumnos en riesgo** (última actividad).

---

## 8. Seguridad — `/admin/seguridad`

**Qué hace el admin aquí:**
- Activar **verificación en dos pasos (MFA)** para la cuenta de administrador.
- Solo accesible por rol admin. En modo demo no está disponible.

---

## 9. Propuestas de lección (UGC) — `/admin/propuestas`

**Qué hace el admin aquí:**
- Listar propuestas enviadas por alumnos (título, descripción, autor, institución, módulo sugerido, estado).
- Filtrar por estado (enviada / todas).
- **Aprobar** propuesta (pasa a siguiente flujo para convertir en lección).
- **Rechazar** con feedback para el autor.

---

## 10. Evaluaciones — `/admin/evaluaciones`

**Qué hace el admin aquí:**
- Ver **estadísticas** de evaluación diagnóstica (por experiencia, motivación, etc.).
- Ver **quiz final**: puntaje promedio, intentos, aprobados, % aprobación.
- Ver **NPS** y encuesta de cierre (metodología, contenido, plataforma, comentarios).
- **Exportar a CSV** respuestas y comentarios.

---

## 11. Talleres (peer review) — `/admin/talleres`

**Qué hace el admin aquí:**
- Listar talleres (por módulo): título, descripción, número de revisiones por par, fechas.
- Enlace a ver el taller como alumno. Crear/editar talleres desde el admin de módulos cuando esté implementado el CRUD completo.

---

## 12. Banco de preguntas — `/admin/banco-preguntas`

**Qué hace el admin aquí:**
- Listar preguntas filtradas por curso y dificultad.
- **Crear** y **editar** preguntas: curso, módulo, enunciado, tipo (opción múltiple, verdadero/falso, respuesta corta), opciones, respuesta correcta, explicación, dificultad, etiquetas.
- **Eliminar** preguntas.

---

## 13. Quizzes — `/admin/quizzes`

**Qué hace el admin aquí:**
- Listar quizzes por curso: título, número de preguntas, puntaje mínimo, tiempo límite, intentos, módulo.
- **Crear** y **editar** quiz: curso, título, cantidad de preguntas, puntaje para aprobar, tiempo límite, intentos máximos, randomizar preguntas/opciones, mostrar explicaciones, módulo asociado.
- Ver **estadísticas** por quiz (intentos, aprobados, % aprobación).

---

## 14. Moderación — `/admin/moderacion`

**Qué hace el admin aquí:**
- Ver **cola de moderación**: contenido reportado (posts comunidad, comentarios, glosario, Show & Tell); autor, texto, nivel, razón, fecha.
- **Aprobar** o **rechazar** con razón; opción de notificar al alumno.
- Ver **historial** de decisiones.
- **Gestionar bans**: listar bans activos; banear usuario (userId, razón, días); desbanear.

---

## 15. Audit log — `/admin/audit`

**Qué hace el admin aquí:**
- Ver **registro de accesos/acciones**: userId, acción, resourceId, fecha.
- Revisar trazabilidad de acciones en la plataforma.

---

## 16. Glosario — `/admin/glosario`

**Qué hace el admin aquí:**
- Seleccionar **curso**.
- Listar términos del glosario (término, definición oficial).
- **Añadir** término con definición oficial.
- Los alumnos ven el glosario por curso en la plataforma.

---

## 17. Conocimiento (grafo) — `/admin/conocimiento`

**Qué hace el admin aquí:**
- Seleccionar **institución** (si aplica).
- Ver y editar **nodos** del grafo de conocimiento (conceptos, módulos, habilidades): id, etiqueta, tipo, descripción, módulo, lecciones, enlaces.
- Ver **aprendices** que han completado un concepto seleccionado (userId, lección, fecha).

---

## 18. Simulaciones — `/admin/simulaciones`

**Qué hace el admin aquí:**
- Listar **simulaciones** (escenarios con opciones y consecuencias).
- **Crear** y **editar**: escenario, opciones (texto + outcome), reflexión, módulo/lección asociados, orden.
- **Eliminar** simulaciones.
- Los alumnos juegan estas simulaciones en el simulador de política pública.

---

## 19. Escape rooms — `/admin/escape-rooms`

**Qué hace el admin aquí:**
- Listar escape rooms disponibles (título, descripción, duración, número de salas).
- En modo demo se muestra uno de ejemplo. Con Firebase se pueden crear en Firestore (colección `escape_rooms`).
- Enlace a ver demo.

---

## 20. Roleplay — `/admin/roleplay`

**Qué hace el admin aquí:**
- Listar **escenarios** de roleplay (título, personaje, línea de apertura, orden).
- **Crear** y **editar** escenario: título, characterPrompt, openingLine, orden.
- Los alumnos usan estos escenarios en la actividad de roleplay con el bot.

---

## 21. Rutas de aprendizaje — `/admin/rutas`

**Qué hace el admin aquí:**
- Listar **rutas**: nombre, descripción, cargos e instituciones objetivo, cursos asignados.
- **Editar** ruta → `/admin/rutas/[id]`: asignación automática por cargo e institución al registrarse el alumno.

---

## 22. API Keys — `/admin/api-keys`

**Qué hace el admin aquí:**
- Listar **API keys**: prefijo, institución, permisos, fecha creación, último uso, revocada.
- **Crear** key: institución, permisos (ej. progreso); copiar valor una vez generado (no se vuelve a mostrar).
- **Revocar** key (las integraciones que la usen dejan de funcionar).

---

## 23. Reglas de inscripción — `/admin/reglas`

**Qué hace el admin aquí:**
- Listar **reglas** automáticas (ej. al completar curso X, inscribir en curso Y o asignar a grupo Z; opción de enviar notificación).
- **Crear** y **editar** regla: nombre, disparador (ej. course_completed), curso completado, curso a inscribir / grupo a asignar, enviar notificación, activa.
- **Eliminar** reglas.
- **Ejecutar** reglas manualmente (procesar pendientes).

---

## 24. Mentores — `/admin/mentores`

**Qué hace el admin aquí:**
- Ver **solicitudes de mentoría**: alumno, mentor, mensaje, estado.
- **Aprobar** o **rechazar** solicitudes. La coordinación con el mentor (ej. WhatsApp) es externa.

---

## 25. Calificaciones (libro de notas) — `/admin/calificaciones`

**Qué hace el admin aquí:**
- Seleccionar **grupo**.
- Ver tabla de calificaciones: userId, email, nota final, % progreso.
- **Exportar a CSV** para el grupo seleccionado.

---

## 26. Competencias SPC — `/admin/competencias`

**Qué hace el admin aquí:**
- Ver **catálogo** de competencias del Servicio Profesional de Carrera (nombre, descripción, nivel, área, fuente, indicadores).
- **Ejecutar seed** para cargar las 8 competencias oficiales si el catálogo está vacío.
- Las competencias se asignan a lecciones al editar cada lección en Cursos.

---

## 27. Necesidades de aprendizaje — `/admin/necesidades`

**Qué hace el admin aquí:**
- Ver respuestas a «¿Qué más quieres aprender?» **agrupadas por frecuencia** (mismo texto = cantidad de alumnos).
- Usar para priorizar contenido o nuevos cursos.

---

## 28. Panel de contenido — `/panel/contenido`

**Qué hace el admin aquí:**
- Acceso desde el sidebar (admin o mentor). Gestionar contenido editorial o bloques según la implementación del panel.

---

## 29. Centro de Comunicación — `/panel/comunicacion`

**Qué hace el admin aquí:**
- Enviar recordatorios a grupo, configurar canales (WhatsApp, push), según la implementación del centro.

---

## Resumen por categoría

| Categoría        | Funcionalidades |
|------------------|------------------|
| **Dashboard**    | Resumen, métricas, alumnos en riesgo, actividad, seed simulador, acceso rápido |
| **Contenido**    | Cursos, módulos, lecciones, contenido de módulo, funcionalidades por curso, generar curso/lecciones con IA |
| **Personas**     | Grupos, invitaciones, alumnos, importar alumnos, perfil alumno, certificados, mentores |
| **Comunicación** | Notificaciones (envío, plantillas, logs), Centro de Comunicación |
| **Evaluación**   | Banco de preguntas, quizzes, talleres, evaluaciones (diagnóstico, quiz, NPS), calificaciones |
| **Contenido extra** | Simulaciones, escape rooms, roleplay, glosario, conocimiento (grafo), competencias |
| **Automación**   | Reglas de inscripción, rutas de aprendizaje, API keys |
| **Moderación**   | Cola de reportes, aprobar/rechazar, bans |
| **Propuestas**   | Aprobar/rechazar propuestas de lección de alumnos |
| **Seguridad**    | MFA para admin |
| **Auditoría**    | Audit log de accesos/acciones |
| **Insights**     | Analytics xAPI, necesidades de aprendizaje |

---

*Documento generado a partir de `app/admin/`, `app/panel/` y APIs bajo `app/api/admin/`.*
