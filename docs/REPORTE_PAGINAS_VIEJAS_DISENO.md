# Reporte: Páginas con diseño viejo (no neumórfico actual)

**Fecha:** 2026-03-16  
**Criterios de “diseño viejo”:** Sin fondo `#f0f2f5` (uso de `#e8eaf0` o blanco), sin sombras neumórficas consistentes, o sin Syne en títulos según DESIGN_SYSTEM.

---

## 1. Resultado del comando: `find app -name "page.tsx" | sort`

```
app/admin/alumnos/[id]/page.tsx
app/admin/alumnos/importar/page.tsx
app/admin/alumnos/page.tsx
app/admin/analytics/page.tsx
app/admin/api-keys/page.tsx
app/admin/audit/page.tsx
app/admin/auditoria/page.tsx
app/admin/banco-preguntas/page.tsx
app/admin/calificaciones/page.tsx
app/admin/certificados/page.tsx
app/admin/cohortes/[id]/retos/nuevo/page.tsx
app/admin/cohortes/[id]/retos/page.tsx
app/admin/cohortes/page.tsx
app/admin/competencias/page.tsx
app/admin/conocimiento/page.tsx
app/admin/course/page.tsx
app/admin/curso/page.tsx
app/admin/cursos/[courseId]/funcionalidades/page.tsx
app/admin/cursos/[courseId]/lecciones/generar/page.tsx
app/admin/cursos/[courseId]/modulos/[moduleId]/contenido/page.tsx
app/admin/cursos/[courseId]/modulos/[moduleId]/leccion/[lessonId]/page.tsx
app/admin/cursos/[courseId]/modulos/[moduleId]/page.tsx
app/admin/cursos/[courseId]/page.tsx
app/admin/cursos/generar/page.tsx
app/admin/cursos/page.tsx
app/admin/escape-rooms/page.tsx
app/admin/evaluaciones/page.tsx
app/admin/glosario/page.tsx
app/admin/mentores/page.tsx
app/admin/moderacion/page.tsx
app/admin/necesidades/page.tsx
app/admin/notificaciones/page.tsx
app/admin/page.tsx
app/admin/propuestas/page.tsx
app/admin/quizzes/page.tsx
app/admin/reglas/page.tsx
app/admin/roleplay/page.tsx
app/admin/rutas/[id]/page.tsx
app/admin/rutas/page.tsx
app/admin/seguridad/page.tsx
app/admin/simulaciones/page.tsx
app/admin/talleres/page.tsx
app/certificado/page.tsx
app/comunidad/page.tsx
app/comunidad/proponer-leccion/page.tsx
app/comunidad/show-and-tell/page.tsx
app/conocimiento/page.tsx
app/curso/evaluacion-final/page.tsx
app/curso/lecciones/[lessonId]/page.tsx
app/curso/modulos/[moduleId]/page.tsx
app/curso/modulos/[moduleId]/recursos/page.tsx
app/curso/page.tsx
app/curso/quiz/[quizId]/page.tsx
app/curso/taller/[workshopId]/page.tsx
app/cursos/[courseId]/leccion-[lessonId]/page.tsx
app/cursos/[courseId]/page.tsx
app/cursos/page.tsx
app/egresados/page.tsx
app/escape-room/[roomId]/page.tsx
app/felicidades/page.tsx
app/glosario/page.tsx
app/inicio/page.tsx
app/laboratorio/escape/page.tsx
app/laboratorio/hablas-humano/glosario/page.tsx
app/laboratorio/hablas-humano/page.tsx
app/laboratorio/page.tsx
app/laboratorio/zona-creatividad/page.tsx
app/laboratorio/zona-exploracion/page.tsx
app/laboratorio/zona-humor/page.tsx
app/laboratorio/zona-juegos/page.tsx
app/login/page.tsx
app/mentores/page.tsx
app/mi-colega/page.tsx
app/mi-perfil/page.tsx
app/mis-calificaciones/page.tsx
app/no-inscrito/page.tsx
app/onboarding/diagnostic/page.tsx
app/page.tsx
app/panel/comunicacion/page.tsx
app/panel/contenido/cursos/[courseId]/modulos/[moduleId]/page.tsx
app/panel/contenido/cursos/[courseId]/page.tsx
app/panel/contenido/lecciones/[lessonId]/page.tsx
app/panel/contenido/page.tsx
app/perfil/page.tsx
app/portafolio/galeria/page.tsx
app/portafolio/page.tsx
app/privacidad/page.tsx
app/registro/page.tsx
app/reto/[id]/page.tsx
app/reto/[id]/resultados/page.tsx
app/retos/page.tsx
app/sesiones-en-vivo/page.tsx
app/sesiones/page.tsx
app/simulador/[id]/page.tsx
app/simulador/page.tsx
app/soporte/page.tsx
app/superadmin/billing/page.tsx
app/superadmin/page.tsx
app/superadmin/tenants/page.tsx
app/tareas/page.tsx
app/verificar/[idCert]/page.tsx
```

---

## 2. Sidebar y menú principal — rutas (href / router.push)

**Fuente:** `components/layout/Sidebar.tsx` (NAV_ITEMS + enlaces extra).

| Destino | Origen |
|--------|--------|
| `/inicio` | Sidebar (logo), migas de pan |
| `/curso` | Sidebar "Mi curso" |
| `/sesiones-en-vivo` | Sidebar "Sesiones en vivo" (redirige a `/sesiones`) |
| `/tareas` | Sidebar "Tareas" |
| `/comunidad` | Sidebar "Comunidad" |
| `/mi-colega` | Sidebar "Mi colega" |
| `/mentores` | Sidebar "Mentores" |
| `/egresados` | Sidebar "Egresados" |
| `/certificado` | Sidebar "Certificado" |
| `/laboratorio` | Sidebar "El Laboratorio" |
| `/soporte` | Sidebar "Soporte" |
| `/mi-perfil` | Sidebar "Mi perfil" |
| `/reto/[id]` | Sidebar "Reto activo" (si hay reto) |
| `/admin` | Sidebar (si rol admin/mentor) |
| `/admin/cursos` | Sidebar (si rol admin/mentor) |
| `/admin/cohortes` | Sidebar (si admin) |
| `/panel/contenido` | Sidebar (si admin/mentor) |
| `/panel/comunicacion` | Sidebar (si admin/mentor) |
| `/admin/notificaciones` | Sidebar (si admin/mentor) |
| `/login` | Sidebar "Cerrar sesión" (`handleSignOut` → `router.push("/login")`) |

**Enlaces desde Inicio (app/inicio/page.tsx):**

- `/curso`, `/sesiones-en-vivo`, `/tareas`, `/comunidad`, `/laboratorio`, `/portafolio`, `/conocimiento`, `/retos`, `/mi-perfil`
- `/curso/lecciones/[id]` (router.push al “siguiente lección”)

**Enlaces desde componentes dashboard:**

- `NextSessionCard`: `/sesiones-en-vivo`
- `ModulesOverviewCard`, `ProgressSummaryCard`, `DashboardHero`: `/curso`
- `CommunityPreviewCard`: `/comunidad`
- `NextTaskCard`: `/tareas`
- `DashboardShell`: `/mi-perfil`

**Otras rutas a las que el alumno puede llegar:**

- `/registro` (link desde login)
- `/no-inscrito` (redirect middleware si no inscrito)
- `/felicidades` (fin de curso)
- `/privacidad` (link desde login/footer)
- `/glosario` (desde curso u otras páginas)
- `/retos` (desde inicio)
- `/portafolio` (desde inicio)
- `/conocimiento` (desde inicio)
- `/laboratorio/escape`, zonas del laboratorio (desde `/laboratorio`)
- `/simulador`, `/simulador/[id]` (desde laboratorio u otras)
- `/reto/[id]`, `/reto/[id]/resultados` (desde sidebar o inicio)
- `/perfil` (ruta alternativa; sidebar apunta a `/mi-perfil`)

---

## 3. Páginas con diseño VIEJO (lista y archivo)

Criterio: uso de **#e8eaf0**, **card-white** sin sombra neumórfica, o **fondos/bloques planos** sin neumorfismo/Syne según DESIGN_SYSTEM.

### 3.1 Páginas que usan `#e8eaf0` (fondo antiguo; DESIGN_SYSTEM exige `#f0f2f5`)

| # | Ruta | Archivo | Notas |
|---|------|---------|--------|
| 1 | `/login` | `app/login/page.tsx` | Fondo y cards #e8eaf0; tiene Syne y sombras en inputs pero fondo no es #f0f2f5. |
| 2 | `/privacidad` | `app/privacidad/page.tsx` | background "#e8eaf0" en contenedor y secciones. |
| 3 | `/conocimiento` | `app/conocimiento/page.tsx` | background '#e8eaf0', Syne; sombras tipo neumórfico en bloques. |
| 4 | `/retos` | `app/retos/page.tsx` | background '#e8eaf0', Syne, cards con sombra 6px 6px 14px. |
| 5 | `/portafolio` | `app/portafolio/page.tsx` | bg: "#e8eaf0", Syne; botones con sombra. |
| 6 | `/laboratorio/escape` | `app/laboratorio/escape/page.tsx` | background "#e8eaf0", Syne. |
| 7 | `/inicio` | `app/inicio/page.tsx` | NM.bg = '#e8eaf0' en tema (DashboardShell/inicio); mezcla de Syne y neumorfismo con fondo viejo. |

### 3.2 Páginas que usan `card-white` (cards planas; sin sombra neumórfica explícita)

En `globals.css`, `[class*="card"]` fuerza `background: var(--neu-bg)` y `border: none`, pero **no** asigna `box-shadow`. Las páginas que solo usan `card-white` quedan con cards del mismo tono que el fondo y sin relieve = aspecto viejo.

| # | Ruta | Archivo | Acceso principal |
|---|------|---------|------------------|
| 8 | `/tareas` | `app/tareas/page.tsx` | Sidebar "Tareas", Inicio, NextTaskCard |
| 9 | `/sesiones` | `app/sesiones/page.tsx` | Sidebar "Sesiones en vivo" (redirect desde /sesiones-en-vivo), Inicio, NextSessionCard |
| 10 | `/comunidad` | `app/comunidad/page.tsx` | Sidebar "Comunidad", Inicio, CommunityPreviewCard |
| 11 | `/soporte` | `app/soporte/page.tsx` | Sidebar "Soporte" |

### 3.3 Páginas que usan el shell con tema `#e8eaf0`

| # | Ruta | Archivo | Notas |
|---|------|---------|--------|
| 12 | `/mi-perfil` | `app/mi-perfil/page.tsx` | Usa `DashboardShell`; el tema en `DashboardShell.tsx` define `NM_LIGHT.bg = "#e8eaf0"`. |

### 3.4 Panel (admin/mentor) — cards planas

| # | Ruta | Archivo | Acceso |
|---|------|---------|--------|
| 13 | `/panel/contenido` | `app/panel/contenido/page.tsx` | Sidebar "Panel de contenido" |
| 14 | `/panel/contenido/cursos/[courseId]` | `app/panel/contenido/cursos/[courseId]/page.tsx` | Desde panel contenido |
| 15 | `/panel/contenido/cursos/[courseId]/modulos/[moduleId]` | `app/panel/contenido/cursos/[courseId]/modulos/[moduleId]/page.tsx` | Desde panel contenido |
| 16 | `/panel/contenido/lecciones/[lessonId]` | `app/panel/contenido/lecciones/[lessonId]/page.tsx` | Desde panel contenido |
| 17 | `/panel/comunicacion` | `app/panel/comunicacion/page.tsx` | Sidebar "Centro de Comunicación" |

### 3.5 Otras páginas de alumno con posible diseño viejo

- **`/certificado`** (`app/certificado/page.tsx`): usa `SurfaceCard` y vars; el contenido está alineado al design system, pero la página en sí no define fondo propio (hereda del layout). **No** se clasifica como “viejo” por código; solo si en pantalla se ve plano.
- **`/no-inscrito`** (`app/no-inscrito/page.tsx`): usa `SurfaceCard` y botones; depende de estilos del layout. Sin #e8eaf0 ni card-white en el archivo. **No** en la lista de viejas por código.
- **`/registro`** (`app/registro/page.tsx`): usa `registro.css` con **#f0f2f5** y sombras neumórficas. **No** diseño viejo.
- **`/perfil`** (`app/perfil/page.tsx`): solo envuelve `PerfilContent` en `max-w-2xl`; sin fondo ni card-white en el archivo. **No** en la lista de viejas por código.

---

## 4. Resumen: páginas viejas y desde dónde se accede

### Alumno (rutas accesibles desde sidebar o inicio)

| Página vieja | Archivo | Desde dónde se accede |
|--------------|---------|------------------------|
| Login | `app/login/page.tsx` | Cerrar sesión, redirect sin sesión |
| Inicio | `app/inicio/page.tsx` | Sidebar "Inicio", logo |
| Tareas | `app/tareas/page.tsx` | Sidebar "Tareas", Inicio, NextTaskCard |
| Sesiones | `app/sesiones/page.tsx` | Sidebar "Sesiones en vivo" → redirect, Inicio, NextSessionCard |
| Comunidad | `app/comunidad/page.tsx` | Sidebar "Comunidad", Inicio, CommunityPreviewCard |
| Soporte | `app/soporte/page.tsx` | Sidebar "Soporte" |
| Mi perfil | `app/mi-perfil/page.tsx` | Sidebar "Mi perfil", Inicio, DashboardShell |
| Portafolio | `app/portafolio/page.tsx` | Inicio |
| Conocimiento | `app/conocimiento/page.tsx` | Inicio |
| Retos | `app/retos/page.tsx` | Inicio |
| Privacidad | `app/privacidad/page.tsx` | Links login/footer |
| Laboratorio · Escape | `app/laboratorio/escape/page.tsx` | Laboratorio (hub) |
| Certificado | `app/certificado/page.tsx` | Sidebar "Certificado" (con SurfaceCard; revisar en UI si se ve viejo) |

### Panel (admin/mentor)

| Página vieja | Archivo | Desde dónde |
|--------------|---------|-------------|
| Panel contenido | `app/panel/contenido/page.tsx` | Sidebar "Panel de contenido" |
| Panel contenido curso | `app/panel/contenido/cursos/[courseId]/page.tsx` | Panel contenido |
| Panel contenido módulo | `app/panel/contenido/cursos/[courseId]/modulos/[moduleId]/page.tsx` | Panel contenido |
| Panel contenido lección | `app/panel/contenido/lecciones/[lessonId]/page.tsx` | Panel contenido |
| Panel comunicación | `app/panel/comunicacion/page.tsx` | Sidebar "Centro de Comunicación" |

---

## 5. Archivos a revisar/cambiar (solo listado; sin cambios)

- `app/login/page.tsx` — sustituir #e8eaf0 por #f0f2f5.
- `app/privacidad/page.tsx` — idem.
- `app/conocimiento/page.tsx` — idem.
- `app/retos/page.tsx` — idem.
- `app/portafolio/page.tsx` — idem.
- `app/laboratorio/escape/page.tsx` — idem.
- `app/inicio/page.tsx` — NM.bg y tema a #f0f2f5 (y/o unificar con DESIGN_SYSTEM).
- `components/dashboard/DashboardShell.tsx` — NM_LIGHT.bg de #e8eaf0 a #f0f2f5.
- `app/tareas/page.tsx` — reemplazar `card-white` por SurfaceCard o card con sombra neumórfica.
- `app/sesiones/page.tsx` — idem.
- `app/comunidad/page.tsx` — idem.
- `app/soporte/page.tsx` — idem; revisar también `border border-gray-200` en listado de tickets.
- `app/panel/contenido/page.tsx` — idem card-white.
- `app/panel/contenido/cursos/[courseId]/page.tsx` — idem.
- `app/panel/contenido/cursos/[courseId]/modulos/[moduleId]/page.tsx` — idem.
- `app/panel/contenido/lecciones/[lessonId]/page.tsx` — idem.
- `app/panel/comunicacion/page.tsx` — idem.

**No se ha modificado ningún archivo;** este documento es solo el reporte solicitado.
