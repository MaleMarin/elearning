# UI Kit Precisar — Enforcement + Refactor — Entregable

## Lista de archivos tocados

| Archivo | Cambios |
|---------|---------|
| `app/globals.css` | Añadido `--inset-highlight` (alias de sombra interior). |
| `components/ui/SurfaceCard.tsx` | Añadida variante `variant: "default" \| "soft"` (soft = `--surface-soft`). |
| `components/ui/Alert.tsx` | Radio unificado `rounded-[20px]` y sombra `--shadow-card-inset`. |
| `components/layout/RightRail.tsx` | "Entrar a Zoom" sustituido por `<AccentButton>`. Bloque de hora con tokens (`--surface-soft`, `--line`, `--shadow-card-inset`). |
| `components/dashboard/DashboardHero.tsx` | Bloque "Continuar donde quedaste" pasa a `<SurfaceCard variant="soft">`. |
| `components/dashboard/NextSessionCard.tsx` | Enlace Zoom sustituido por `<AccentButton>`. |
| `app/(app)/inicio/page.tsx` | Skeleton de carga con `<SurfaceCard>` (sin divs sueltos). |
| `app/admin/cursos/page.tsx` | Fondo `bg-[var(--bg)]`. Error con `<Alert>` + SecondaryButton Reintentar. Lista de cursos con `<ListRow>` (left, title, badge, children = botones). Input crear curso con `input-premium` y tokens. |
| `app/admin/cohortes/page.tsx` | Inputs con `input-premium` y tokens. Form "Generar código" dentro de `<SurfaceCard variant="soft">`. Botón Copiar (código generado y tabla) con `<SecondaryButton>`. Caja del código generado con tokens (`--surface-soft`, `--line`, `--shadow-card-inset`). |
| `app/no-inscrito/page.tsx` | Fondo `bg-[var(--bg)]`. "Ir a iniciar sesión" → `<PrimaryButton href="/login">`. "Solicitar acceso" → `<SecondaryButton>`. "Contactar soporte" y "Cerrar sesión" → `<SecondaryButton>`. Input código con `input-premium`. SurfaceCards con `clickable={false}`. Eliminado import `Link` no usado. |
| `app/curso/page.tsx` | Skeleton con `<SurfaceCard>` y bloques internos con tokens (`--surface-soft`). |

---

## Confirmación por pantalla (solo kit, sin estilos inventados)

| Pantalla | Componentes del kit usados | Estilos ad-hoc |
|----------|----------------------------|----------------|
| **/inicio** | SurfaceCard (hero, grid cards, módulos), ProgressBar, PrimaryButton, SecondaryButton, AccentButton (NextSessionCard), ListRow, EmptyState. Skeleton: SurfaceCard. | Ninguno. |
| **/curso** | SurfaceCard, PrimaryButton, ListRow, EmptyState. Skeleton: SurfaceCard. | Ninguno. |
| **/admin/cursos** | PageSection, SurfaceCard, Alert, PrimaryButton, SecondaryButton, Badge, EmptyState, ListRow. Input: clase `input-premium`. Fondo: `var(--bg)`. | Ninguno. |
| **/admin/cohortes** | PageSection, SurfaceCard (default + soft), Alert, PrimaryButton, SecondaryButton, Badge, EmptyState. Inputs: `input-premium`. Tabla con bordes/ fondos con tokens. | Ninguno. |
| **/no-inscrito** | SurfaceCard, PrimaryButton, SecondaryButton, Alert. Input: `input-premium`. Fondo: `var(--bg)`. | Ninguno. |
| **/login** | AuthCard (ya usa SurfaceCard internamente). Fondo: `var(--bg)`. | Ninguno. |

---

## Antes / Después

### /admin/cursos

- **Antes:** Contenedor con `bg-[#F3F2EF]`. Card de error con `border border-red-200 bg-red-50/50`. Lista de cursos como `<ul>/<li>` con estilos manuales (flex, BookOpen, Badge, botones). Input con clases propias.
- **Después:** Contenedor con `bg-[var(--bg)]`. Error mostrado con `<Alert variant="error">` y botón "Reintentar" con SecondaryButton. Lista con `<ListRow>` por curso (icono, título, badge Publicado/Borrador, botones Publicar/Editar). Input con `input-premium` y tokens. Misma funcionalidad; aspecto unificado con el resto del kit (sombras, bordes, relieve).

### /curso

- **Antes:** Skeleton con divs `rounded-xl border border-[var(--line-subtle)] bg-[var(--surface)]` y barras de pulse. Contenido ya usaba SurfaceCard, ListRow, EmptyState, PrimaryButton.
- **Después:** Skeleton con `<SurfaceCard>` que envuelve cada bloque; interior con `bg-[var(--surface-soft)]` y `animate-pulse`. Contenido sin cambios (ya cumplía el kit). La carga se ve coherente con el resto de la app (mismo radio y profundidad que las cards reales).

---

## Regla de oro

Patrones nuevos: primero como componente del kit en `/components/ui` o `/components/layout`, luego uso en pantallas. No se permiten estilos ad-hoc por pantalla.
