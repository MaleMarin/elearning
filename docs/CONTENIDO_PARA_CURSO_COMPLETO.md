# Lista de contenido para un curso completo

Todo lo que debes preparar o entregar para que el alumno pueda hacer un curso completo en la plataforma. Puedes copiar esta lista y usarla como checklist.

---

## 1. CURSO (nivel general)

- [ ] **Título del curso**
- [ ] **Descripción** (texto que ve el alumno)
- [ ] **Estado**: borrador → publicado cuando esté listo
- [ ] **Funcionalidades del curso** (en Admin: plantilla o flags): certificado con QR, peer review, spaced repetition, etc.

---

## 2. MÓDULOS (por cada módulo)

- [ ] **Título del módulo**
- [ ] **Descripción**
- [ ] **Orden** (order_index: 1, 2, 3…)
- [ ] **Estado**: borrador → publicado
- [ ] **Objetivos de aprendizaje** (lista de frases, una por línea)
- [ ] **Etiqueta de logro** (opcional; ej. “Módulo 1 completado”)
- [ ] **Bibliografía del módulo** (opcional): tipo, título, autor, año, descripción, URL, si es obligatorio
- [ ] **Podcasts** (opcional): título, programa, descripción, duración, URL o embedUrl, imagen
- [ ] **Videos** (opcional): título, canal, descripción, duración, youtubeId, si es obligatorio
- [ ] **Grabación de sesión en vivo** (opcional): fecha, título, facilitador, duración, youtubeId o storageUrl, transcripción

---

## 3. LECCIONES (por cada lección)

- [ ] **Título de la lección**
- [ ] **Resumen** (una o dos líneas)
- [ ] **Contenido** (HTML o bloques: texto, encabezados, callouts, listas, código, checklist, imagen, video embed, etc.)
- [ ] **URL del video** (embed, ej. YouTube) si aplica
- [ ] **Duración estimada** (minutos)
- [ ] **Orden dentro del módulo** (order_index)
- [ ] **Estado**: borrador → publicado
- [ ] **Competencias** (opcional): id de competencia + nivel
- [ ] **Subtítulos** (opcional): URL o generados
- [ ] **Contenido H5P** (opcional): id si usas actividades H5P
- [ ] **Recursos adjuntos** (opcional): nombre, archivo o ruta de almacenamiento, tipo MIME, tamaño

---

## 4. PREGUNTAS Y QUIZZES

- [ ] **Banco de preguntas** (por curso/módulo): enunciado, tipo (opción múltiple / verdadero-falso / respuesta corta), opciones, respuesta correcta, explicación, dificultad, etiquetas
- [ ] **Quizzes por módulo o final**: título, número de preguntas, puntaje mínimo para aprobar, tiempo límite (minutos), intentos máximos, si randomizar preguntas/opciones, si mostrar explicaciones, módulo asociado

---

## 5. TALLERES (peer review / entregas por pares)

- [ ] **Por cada taller**: título, descripción, **rúbrica** (criterios con etiqueta y puntaje máximo), fecha límite de entrega, fecha límite de revisión, número de revisiones por par (peerCount)

---

## 6. TAREAS (actividades asignadas al alumno o grupo)

- [ ] **Por cada tarea**: título, instrucciones, fecha de entrega (due_at). Completado (completed_at) lo marca el alumno o el sistema.

---

## 7. SESIONES EN VIVO

- [ ] **Por cada sesión**: título, fecha/hora programada (scheduled_at), enlace de reunión (meeting_url), cohorte/grupo asociado
- [ ] **Grabaciones**: si hay grabación, subir o enlazar (YouTube/storage) y vincular al módulo (liveRecording: titulo, facilitador, duracion, youtubeId o storageUrl, transcripcion)

---

## 8. EVALUACIÓN (diagnóstico, quiz final, cierre)

- [ ] **Diagnóstico inicial**: preguntas/ítems (experiencia, motivación, retos, expectativa, disponibilidad) si la plataforma lo usa
- [ ] **Quiz final**: preguntas (o usar las por defecto de innovación pública que ya trae la plataforma)
- [ ] **Encuesta de cierre**: ítems de metodología, contenido, plataforma (escalas 1–5), NPS, comentario libre

---

## 9. RETOS (por grupo/cohorte)

- [ ] **Por cada reto**: título, descripción, fecha inicio, fecha fin, criterios de evaluación, descripción del premio. Opcional: equipos, ganador

---

## 10. COMUNIDAD (foro / posts)

- [ ] **Posts de bienvenida o fijados** (opcional): título, cuerpo, cohorte/grupo, si está fijado
- [ ] Los comentarios y posts los crean alumnos y facilitadores; no es contenido que “entregues” salvo ejemplos iniciales

---

## 11. PORTAFOLIO

- [ ] **Criterios o rúbrica** para evaluar proyectos (si aplica). El contenido lo genera el alumno (título, institución, problema, solución, resultado, evidencias, etc.)

---

## 12. CONOCIMIENTO (grafo de nodos)

- [ ] **Nodos**: id, etiqueta, tipo (módulo / concepto / habilidad), descripción, módulo asociado, nivel, lessonIds, enlaces a otras ids
- [ ] **Enlaces**: source, target (ids de nodos), si está completado

---

## 13. EXTRAS (según configuración del curso)

- [ ] **Escape room**: salas, preguntas, respuestas correctas
- [ ] **Simulaciones / roleplay**: escenarios, opciones, ramas
- [ ] **Glosario del curso**: términos con definición oficial (por curso)
- [ ] **Laboratorio**: frase semanal (opcional), zonas (juegos, creatividad, exploración, humor, etc.)
- [ ] **Propuestas de lección (UGC)**: no es contenido que entregues; son propuestas que envían alumnos y que un admin puede aprobar y convertir en lección

---

## 14. INSCRIPCIÓN Y GRUPO

- [ ] **Cohorte/grupo** creado con nombre y fechas si aplica
- [ ] **Inscripciones** (enrollments): asignar alumnos al grupo y al curso para que tengan acceso
- [ ] **Curso asignado** al grupo para que aparezca en “Mi curso”

---

## Resumen mínimo para que el alumno “haga el curso”

1. Un **curso** publicado con al menos un **módulo** publicado.
2. En cada módulo, al menos una **lección** publicada (título, contenido o video, duración).
3. **Inscripción** del alumno (enrollment) al curso/grupo para que vea “Mi curso” y el programa.
4. Opcional pero recomendado: **progreso** (marcar lecciones completadas), **quiz** por módulo o final, **tareas** o **talleres** si el diseño del curso los incluye.
5. Opcional: sesiones en vivo, retos, comunidad, portafolio, conocimiento, laboratorio, según las funcionalidades que tengas activadas.

---

*Documento generado a partir de la estructura de la plataforma elearningPD (cursos, módulos, lecciones, Firestore, Supabase y APIs).*
