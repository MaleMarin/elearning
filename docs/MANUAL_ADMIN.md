# Manual del administrador — Política Digital

Este manual está pensado para quien gestiona la plataforma sin conocimientos técnicos. Explica paso a paso las tareas más habituales.

- ✅ HECHO: LearningNeedsCard en /inicio  
- ✅ HECHO: Página /admin/rutas/[id]  
- ✅ HECHO: assignLearningPath en el onboarding (al actualizar perfil con cargo e institución)

---

## 1. Primeros pasos — Cómo crear el primer curso

### Entrar al panel de administración

1. Inicia sesión con una cuenta que tenga rol **administrador**.
2. En el menú principal, entra a **Panel de administración** (o abre la ruta `/admin`).
3. Verás el menú lateral con secciones: Contenido, Alumnos, Comunicación, Análisis, Sistema.

### Crear tu primer curso

1. En el menú lateral, haz clic en **Cursos** (dentro de *Contenido*).
2. En la página de cursos, usa el formulario para **crear un nuevo curso**:
   - **Título:** por ejemplo: *Introducción a la innovación pública*.
   - **Descripción:** un párrafo breve sobre qué aprenderán los alumnos (opcional).
   - **Estado:** deja *Borrador* hasta que el contenido esté listo.
3. Pulsa **Crear** o **Guardar**.
4. El curso aparecerá en la lista. Haz clic en él para **editarlo** y añadir módulos.

### Añadir módulos y lecciones

1. Dentro del curso, en la sección **Módulos**, pulsa **Añadir módulo**.
2. Escribe el título del módulo (por ejemplo: *Módulo 1 — Fundamentos*) y crea el módulo.
3. En la lista de módulos, haz clic en **Editar** en el módulo que quieras.
4. En la página del módulo verás **Lecciones**. Añade lecciones con **Añadir lección** (título, resumen, contenido).
5. Para cada lección puedes indicar **minutos estimados** y, si aplica, la URL de un **video** (YouTube u otro).
6. Cuando todo esté listo, cambia el **Estado** del curso y de cada módulo/lección a **Publicado** para que los alumnos puedan verlo.

### Asignar el curso a una cohorte

1. Crea o elige una **Cohorte** (ver sección 3).
2. En la página del curso, en **Asignar a cohorte**, selecciona la cohorte y pulsa **Asignar**.
3. Los alumnos de esa cohorte verán el curso en su pantalla *Mi curso*.

**Resumen:** Curso → Módulos → Lecciones → Publicar → Asignar a cohorte.

---

## 2. Gestión de módulos y contenido

### Editar un módulo

1. **Admin → Cursos** → elige el curso → en la lista de módulos, **Editar** en el módulo.
2. Puedes cambiar:
   - **Título** y **Descripción** (esta descripción se muestra en la *landing* del módulo para el alumno).
   - **Objetivos (uno por línea):** qué aprenderán (también se muestra en la landing del módulo).
   - **Recompensa / insignia al completar:** texto que verá el alumno al terminar el módulo (por ejemplo: *Insignia Fundamentos*).
   - **Estado:** Borrador o Publicado.

### Contenido del módulo (bibliografía, videos, podcasts)

1. En la página del módulo, usa el enlace **Contenido del módulo** (o la ruta *Contenido del módulo* en la parte superior).
2. Ahí puedes configurar **bibliografía**, **videos** y **podcasts** recomendados para ese módulo. Los alumnos los verán en la pestaña *Contenido* dentro del módulo.

### Orden de lecciones

Las lecciones se muestran en el orden en que fueron creadas. Si necesitas cambiar el orden, suele haber un campo *Orden* o *order_index* al editar cada lección (según la versión de la plataforma).

### Importar contenido (SCORM o PowerPoint)

- **SCORM:** En la zona de administración del curso/módulo, busca la opción de **Importar SCORM** (archivo ZIP). Sube el paquete y se crearán lecciones en borrador.
- **PowerPoint:** Busca **Importar PowerPoint** (archivo PPTX). Se generará una lección con una diapositiva por sección.

Si no ves estas opciones en pantalla, pueden estar en **Editar módulo** o en un menú *Importar* dentro del curso.

---

## 3. Gestión de alumnos y cohortes

### Qué es una cohorte

Una **cohorte** es un grupo de alumnos que comparten las mismas fechas y los mismos cursos. Por ejemplo: *Cohorte 2025-1 — Programa Innovación Pública*.

### Crear una cohorte

1. **Admin → Cohortes**.
2. Usa el botón o formulario **Crear cohorte**.
3. Rellena:
   - **Nombre** (por ejemplo: *Marzo 2025 — SFP*).
   - **Fechas de inicio y fin** (opcional pero recomendado).
   - **Curso** a asignar (si la plataforma lo pide al crear).
4. Guarda. La cohorte aparecerá en la lista.

### Asignar alumnos a una cohorte

- **Código de invitación:** muchas plataformas generan un **código** por cohorte. Los alumnos entran a la plataforma y, en *Inscripción* o *Unirse a cohorte*, escriben ese código para inscribirse.
- **Importar alumnos:** en **Admin → Alumnos** o **Admin → Cohortes** puede haber una opción **Importar** (CSV o Excel) para dar de alta muchos alumnos a la vez y asignarlos a una cohorte.
- **Asignación manual:** en la ficha de la cohorte, a veces hay **Añadir alumno** indicando el correo o nombre de usuario.

### Rutas de aprendizaje (asignación por cargo e institución)

1. **Admin → Rutas de aprendizaje**.
2. Las **rutas** permiten asignar automáticamente cursos a quienes tengan un **cargo** y **institución** concretos (los que el alumno indica en su perfil).
3. **Crear ruta:** nombre, descripción, **cargos objetivo** (separados por coma, por ejemplo: *Jefe de proyecto, Coordinador*) e **instituciones objetivo** (por ejemplo: *SFP, SHCP*). Si dejas instituciones vacías, la ruta aplica a cualquier institución.
4. Añade los **cursos** que forman la ruta, en el orden deseado.
5. Marca la ruta como **Activa** para que, cuando un alumno actualice su **perfil** (cargo e institución), se le asignen automáticamente los cursos de esa ruta.
6. **Editar ruta:** en la lista, clic en **Editar** en una ruta para cambiar nombre, cargos, instituciones, cursos o activar/desactivar.

### Reglas de inscripción

En **Admin → Reglas de inscripción** puedes definir reglas automáticas (por ejemplo: *si cumple X condición, inscribir en el curso Y*). Rellena los campos que te pida la pantalla (nombre de la regla, condiciones, curso de destino) y activa la regla si quieres que se aplique.

---

## 4. Certificados

### Dónde se gestionan

1. **Admin → Certificados** (en el menú *Alumnos*).
2. Ahí suele verse una lista de alumnos por cohorte o por curso, con el estado *Pendiente* o *Emitido*.

### Emitir certificados

- **Por alumno:** localiza al alumno y usa el botón **Emitir certificado** (o similar). El sistema generará el certificado (por ejemplo en PDF) y, si está configurado, lo enviará por correo.
- **En lote:** si existe la opción **Emitir en lote** o **Emitir a todos los aprobados**, selecciona la cohorte o curso y confirma. Se emitirán certificados a quienes cumplan los criterios (por ejemplo: curso completado).

### Verificación con QR

Si la plataforma tiene **verificación con QR**, los certificados llevan un código o enlace que terceros pueden escanear para comprobar que el certificado es válido. No suele requerir acción del administrador más que activar la funcionalidad (a veces desde *Feature flags*, ver sección 7).

---

## 5. Notificaciones

### Dónde se configuran

1. **Admin → Notificaciones** (en *Comunicación*).
2. Desde ahí se suelen enviar **notificaciones push** o **recordatorios** a los alumnos.

### Enviar una notificación

1. Elige el **destinatario** (todos, una cohorte, o alumnos concretos).
2. Escribe **título** y **mensaje**.
3. Pulsa **Enviar** o **Programar**.

### Recordatorios automáticos

Algunas plataformas permiten configurar recordatorios (por ejemplo: *tarea pendiente*, *quiz pendiente*). Si existe una pantalla de **Plantillas** o **Tipos de notificación**, ahí se suelen definir estos mensajes automáticos.

### WhatsApp

Si la plataforma está integrada con WhatsApp, puede haber una sección o configuración específica para **recordatorios por WhatsApp**. Actívala o configúrala según las instrucciones de tu instalación.

---

## 6. Analytics

### Dashboard principal

1. **Admin → Dashboard** (inicio del panel).
2. Suele mostrar:
   - **Alumnos activos** (inscritos en al menos una cohorte).
   - **Tasa de completación** (por ejemplo, porcentaje de alumnos que completaron el curso).
   - **Certificados emitidos**.
   - **Alumnos en riesgo** (poca actividad o bajo progreso), para poder contactarlos.

### Alumnos en riesgo

En el dashboard o en **Admin → Alumnos** puede haber un apartado **En riesgo** o **At risk**: lista de alumnos con última actividad hace más de 5 días y progreso bajo (por ejemplo &lt; 30%). Úsalo para enviar un recordatorio o ofrecer apoyo.

### Analytics y evaluaciones

- **Admin → Analytics:** gráficas o tablas de uso (accesos, lecciones completadas, etc.).
- **Admin → Evaluaciones:** resultados de quizzes o exámenes por cohorte o curso.

Revisa las pestañas o filtros (por curso, por cohorte, por fechas) para sacar los informes que necesites.

---

## 7. Feature flags — Activar o desactivar funcionalidades por curso

### Qué son los feature flags

Cada curso puede tener **activadas o desactivadas** ciertas funcionalidades. Así, un curso técnico puede no mostrar *El Laboratorio* o el *Simulador de política*, y un curso largo puede tener activos *badges*, *ranking* y *certificado con QR*.

### Dónde se configuran

1. **Admin → Cursos** → elige el curso.
2. En la página del curso, busca la tarjeta **Funcionalidades** y pulsa **Configurar** (o ve a *Funcionalidades del curso*).

### Cómo usarlo

1. Verás **plantillas** (por ejemplo: *Programa completo*, *Curso básico*, *Ciberseguridad*, *Onboarding rápido*). Pulsa una plantilla para cargar un conjunto de opciones de una vez.
2. Luego revisa las **secciones** (Aprendizaje, Evaluación, Gamificación, Comunidad, El Laboratorio, Notificaciones, Contenido, Certificado) y en cada una activa o desactiva los interruptores según lo que quieras para ese curso.
3. **Guardar configuración** al final.

**Ejemplo:** Para un curso de ciberseguridad puedes elegir la plantilla *Ciberseguridad* y dejar activos certificado, QR, peer review, repaso espaciado y bibliografía, y desactivar trivia o leaderboard.

---

## 8. Preguntas frecuentes

### No veo el menú de administración

Solo las cuentas con rol **administrador** ven el panel. Si iniciaste sesión y no lo ves, contacta al responsable técnico para que te asigne el rol de admin.

### He creado un curso pero los alumnos no lo ven

Comprueba: (1) que el **curso** esté en estado **Publicado**; (2) que los **módulos** y **lecciones** estén también publicados; (3) que el curso esté **asignado a la cohorte** en la que están los alumnos.

### Un alumno dice que no puede inscribirse

Confirma que tiene el **código de invitación** correcto de la cohorte y que lo escribe en el lugar indicado (por ejemplo, *Unirse a cohorte* o *Inscripción*). Si usáis reglas automáticas o rutas de aprendizaje, verifica que su **perfil** tenga cargo e institución completos.

### ¿Cómo cambio el orden de los módulos?

En la lista de módulos del curso suele haber un campo **Orden** o un botón para subir/bajar. Edita cada módulo y ajusta el número de orden (0, 1, 2…) para que aparezcan en el orden deseado.

### Los certificados no se generan

Comprueba que el alumno haya **completado** el curso (según los criterios de la plataforma) y que la opción de **certificado** esté **activada** en los *Feature flags* del curso. Revisa también la sección **Certificados** del admin por si hay errores o cola de generación.

### ¿Dónde veo las preguntas o sugerencias de los alumnos?

En **Admin → Necesidades de aprendizaje** (en *Análisis*) se listan las sugerencias que los alumnos envían desde la tarjeta *¿Qué más quieres aprender?* en su inicio.

---

**Manual elaborado para administradores de la plataforma Política Digital. Para dudas técnicas o de instalación, contactar al equipo de desarrollo.**

🏁 TODO COMPLETADO
