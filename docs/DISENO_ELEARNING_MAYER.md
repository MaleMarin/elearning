# Diseño instruccional y reducción de carga cognitiva

Este documento resume cómo la plataforma aplica principios de la **Teoría Cognitiva del Aprendizaje Multimodal** (Richard Mayer) y buenas prácticas de UX para reducir la carga cognitiva y mejorar la retención en cursos de política digital y certificaciones profesionales.

---

## 1. Principios de Mayer aplicados en la plataforma

### Coherencia
- **Qué es:** Eliminar material irrelevante para que la pantalla no distraiga.
- **En la plataforma:** Contenido por lección centrado en una idea o habilidad; sin elementos decorativos innecesarios. Uso del sistema de diseño (colores, tipografía, componentes) de forma consistente.

### Segmentación
- **Qué es:** Dividir el contenido en partes manejables y dar control al usuario (pausar, avanzar).
- **En la plataforma:** Lecciones cortas (recomendado 5–15 min); navegación “Anterior / Siguiente” y lista de módulos para que el alumno avance a su ritmo. El campo `estimated_minutes` indica la duración esperada de cada lección.

### Redundancia
- **Qué es:** Evitar combinar narración + imagen + texto escrito todo a la vez en lecciones cortas.
- **En la plataforma:** Soporte para video embebido y texto por separado; se recomienda en contenidos que el video use narración con imágenes, o texto con imágenes, pero no los tres a la vez en el mismo bloque.

### Modalidad
- **Qué es:** Gráficos o imágenes con narración suelen funcionar mejor que gráficos con mucho texto en pantalla.
- **En la plataforma:** Las lecciones permiten `video_embed_url` y `content` (Markdown); se recomienda priorizar video con voz para explicaciones complejas y reservar el texto para resúmenes o lecturas complementarias.

### Contiguidad (espacial y temporal)
- **Qué es:** Textos e imágenes relacionados deben estar juntos y mostrarse de forma coordinada.
- **En la plataforma:** En la vista de lección, el título, resumen, video y cuerpo del contenido están agrupados en un mismo flujo; la barra de progreso y “Lección X de Y” están junto al contexto del módulo para que el alumno no tenga que buscar dónde está.

### Señalización
- **Qué es:** Destacar lo esencial con títulos, viñetas e indicadores visuales.
- **En la plataforma:** Uso de `PageSection` con título y subtítulo; badges “Completada” / “En curso”; barra de progreso; duración estimada visible (“~X min”). El contenido en Markdown permite listas y encabezados para escaneo rápido.

### Preentrenamiento
- **Qué es:** Reducir carga cognitiva presentando antes los nombres y características de los conceptos clave.
- **En la plataforma:** Cada lección tiene `title` y `summary`; el listado de módulos y lecciones en `/curso` da contexto previo (Módulo N, duración estimada) antes de entrar al detalle.

### Personalización
- **Qué es:** Lenguaje cercano y claro en lugar de excesivamente formal.
- **En la plataforma:** Mensajes como “Sigue a tu ritmo”, “¡Bien! Completaste esta lección” y etiquetas claras (“Lección X de Y”, “Completada”, “Pendiente”) para que la interfaz sea comprensible y cercana.

---

## 2. Visibilidad de estado y autonomía (UX)

- **Barra de progreso:** En la vista de lección se muestra el avance del curso (lecciones completadas / total) para que el alumno sepa en todo momento dónde está y cuánto falta.
- **Posición en la ruta:** Texto “Lección X de Y” y “Módulo N de M” para contexto inmediato.
- **Control del usuario:** Navegación Anterior/Siguiente y posibilidad de marcar como completada o pendiente; el alumno puede pausar y retomar cuando quiera.

---

## 3. Estructura de cursos (alineada con ADDIE)

- **Análisis:** Definir audiencia y objetivos por curso (ej. profesionales de auditoría, riesgo, gobierno).
- **Diseño:** Módulos por dominios temáticos; lecciones lineales y secuenciales (un concepto apoya al siguiente).
- **Desarrollo:** Contenidos en formato microlearning (5–15 min por lección); mezcla de video, texto y recursos descargables.
- **Implementación:** Cursos publicados por cohorte; progreso guardado por usuario y curso.
- **Evaluación:** Completitud por lección; posibilidad de extender con quizzes y criterios de aprobación por módulo (futuro).

---

## 4. Recomendaciones para autores de contenido

1. **Una lección = una idea o habilidad** para evitar sobrecarga.
2. **Rellenar `estimated_minutes`** para que el alumno planifique (segmentación).
3. **Resumen corto** en cada lección como preentrenamiento.
4. En **videos**, preferir narración con imágenes; si hay texto en pantalla, que sea breve (evitar redundancia).
5. **Títulos y listas** en el contenido para facilitar el escaneo (señalización).

---

*Referencia: teoría de Mayer sobre aprendizaje multimodal y carga cognitiva; heurísticas de usabilidad (visibilidad de estado, control del usuario).*
