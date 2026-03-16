# Design System — Política Digital

**Este archivo es la fuente de verdad visual de toda la plataforma.**  
Cursor debe leerlo ANTES de crear o modificar cualquier componente.

---

## 1. Identidad visual

- **Nombre:** Política Digital · Innovación Pública · México
- **Estilo:** Neumorfismo moderno — superficies que flotan o se hunden
- **Tipografía:**
  - **Raleway** (400, 600, 700, 800) — títulos, headers, labels, navegación, botones
  - **Source Sans Pro** (400, 600, 700) — párrafos, contenido, descripciones, inputs
  - **Space Mono** (400, 700) — datos, código, métricas (mantener)
- **Variables CSS:** `--font-heading` (Raleway), `--font-body` (Source Sans 3), Space Mono donde aplique
- **NO usar:** Inter, Roboto, Arial, Syne, Plus Jakarta Sans, ni ninguna fuente serif en el dashboard

---

## 2. Paleta de colores — usar SIEMPRE estos valores exactos

```css
:root {
  /* Primarios */
  --azul:        #1428d4;   /* azul eléctrico — color dominante */
  --azul-bright: #2b4fff;   /* hover, gradientes, barras */
  --azul-dark:   #0a0f8a;   /* sombras de color, texto oscuro */

  /* Acento */
  --acento:      #00e5a0;   /* verde menta — logros, completado, activo */
  --acento-dark: #00b87d;   /* hover del acento */
  --acento-glow: rgba(0, 229, 160, 0.35);

  /* Fondo neumórfico */
  --neu-bg:      #f0f2f5;   /* BASE de toda la plataforma */

  /* Sombras — calibradas para #f0f2f5 */
  --neu-shadow-out:
    8px 8px 18px rgba(174, 183, 194, 0.65),
    -8px -8px 18px rgba(255, 255, 255, 0.92);

  --neu-shadow-out-sm:
    4px 4px 10px rgba(174, 183, 194, 0.6),
    -4px -4px 10px rgba(255, 255, 255, 0.90);

  --neu-shadow-in:
    inset 4px 4px 10px rgba(174, 183, 194, 0.55),
    inset -4px -4px 10px rgba(255, 255, 255, 0.85);

  --neu-shadow-in-sm:
    inset 2px 2px 6px rgba(174, 183, 194, 0.5),
    inset -2px -2px 6px rgba(255, 255, 255, 0.82);

  --neu-glow:
    6px 6px 14px rgba(174, 183, 194, 0.6),
    -6px -6px 14px rgba(255, 255, 255, 0.92),
    0 0 20px rgba(20, 40, 212, 0.12);

  --neu-glow-acento:
    6px 6px 14px rgba(174, 183, 194, 0.6),
    -6px -6px 14px rgba(255, 255, 255, 0.92),
    0 0 16px rgba(0, 229, 160, 0.25);
}
```

### Colores PROHIBIDOS — nunca usar en componentes nuevos

| Valor    | Motivo           |
|----------|------------------|
| `#e8ecf0` | Fondo antiguo    |
| `#b49130` | Dorado antiguo   |
| `#c9a83c` | Dorado antiguo   |
| `#1e3a8a` | Azul antiguo     |
| `#1e50c8` | Azul antiguo     |

---

## 3. Reglas del neumorfismo

### Regla 1 — El fondo siempre es #f0f2f5

Todo elemento que no sea un botón, input o card especial usa `background: var(--neu-bg)`.  
**Nunca** usar `background: white` ni `background: #fff` en el dashboard.

### Regla 2 — Flotar = sombra hacia afuera

Usar para: cards, botones interactivos, elementos en reposo.

```css
.neu-card {
  background: var(--neu-bg);
  border: none;
  border-radius: 16px;
  box-shadow: var(--neu-shadow-out);
}
```

### Regla 3 — Hundir = sombra hacia adentro

Usar para: inputs, elementos activos/seleccionados, items del sidebar activos, opciones de quiz seleccionadas, módulos bloqueados.

```css
.neu-input {
  background: var(--neu-bg);
  border: none;
  border-radius: 12px;
  box-shadow: var(--neu-shadow-in);
}
```

### Regla 4 — Sin bordes

**NUNCA** usar `border: 1px solid` en cards o inputs neumórficos. Las sombras reemplazan los bordes.  
Excepción: bordes de acento semántico (éxito, error, info) con opacidad &lt; 0.4.

### Regla 5 — Hover: más sombra + translateY(-2px)

```css
.neu-card:hover {
  box-shadow: var(--neu-glow);
  transform: translateY(-2px);
  transition: box-shadow 0.2s, transform 0.15s;
}
```

### Regla 6 — Active/click: hundir

```css
.neu-btn:active {
  box-shadow: var(--neu-shadow-in);
  transform: translateY(0);
}
```

### Regla 7 — El certificado PDF NO es neumórfico

El certificado mantiene su diseño editorial (#faf8f3 + azul + verde menta). Es un documento imprimible, no una interfaz.

---

## 4. Componentes — especificaciones exactas

### Botón primario

```css
.btn-primary {
  background: var(--neu-bg);
  color: var(--azul);
  border: none;
  border-radius: 50px;
  font-weight: 600;
  font-family: var(--font-heading);
  box-shadow: var(--neu-shadow-out-sm);
  transition: box-shadow 0.15s, transform 0.1s;
}
.btn-primary:hover {
  box-shadow: var(--neu-glow);
  transform: translateY(-1px);
}
.btn-primary:active {
  box-shadow: var(--neu-shadow-in);
  transform: translateY(0);
}
```

### Botón secundario (hundido)

```css
.btn-secondary {
  background: var(--neu-bg);
  color: var(--color-text-secondary);
  border: none;
  border-radius: 50px;
  box-shadow: var(--neu-shadow-in-sm);
}
```

### Input / Textarea

```css
input, textarea, select {
  background: var(--neu-bg);
  border: none;
  border-radius: 12px;
  box-shadow: var(--neu-shadow-in);
  color: var(--azul);
  font-family: var(--font-body);
  outline: none;
}
input:focus, textarea:focus {
  box-shadow: var(--neu-shadow-in), 0 0 0 2px rgba(0, 229, 160, 0.3);
}
```

### Card estándar

```css
.card {
  background: var(--neu-bg);
  border: none;
  border-radius: 16px;
  box-shadow: var(--neu-shadow-out-sm);
  padding: 16px;
}
```

### Card destacada (acción principal)

```css
.card-featured {
  background: var(--neu-bg);
  border: none;
  border-radius: 16px;
  box-shadow: var(--neu-glow);
}
```

### Sidebar item activo (hundido)

```css
.nav-item.active {
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow-in-sm);
  color: var(--azul);
  font-weight: 500;
  border-radius: 8px;
}
```

### Badge / Pill de acento

```css
.badge-success {
  background: rgba(0, 229, 160, 0.12);
  color: var(--acento-dark);
  border: 0.5px solid rgba(0, 229, 160, 0.3);
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
}
```

### Barra de progreso

```css
.progress-track {
  height: 6px;
  background: var(--neu-bg);
  border-radius: 4px;
  box-shadow: var(--neu-shadow-in-sm);
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--azul), var(--azul-bright));
  border-radius: 4px;
  box-shadow: 0 0 8px rgba(20, 40, 212, 0.4);
}
```

### Banner azul (hero del dashboard y secciones principales)

```css
.banner-hero {
  background: var(--azul);
  border-radius: 16px;
  /* Con patrón de puntos sutil */
  background-image:
    radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px),
    linear-gradient(135deg, #1428d4, #2b4fff);
  background-size: 24px 24px, 100% 100%;
}
```

---

## 5. Layout y estructura de páginas

### Shell principal (todas las páginas autenticadas)

```
┌─────────────────────────────────────────────────────┐
│ SIDEBAR (196px)  │  TOPBAR (42px alto)              │
│                  ├──────────────────────────────────│
│  Logo            │  Migas de pan    │  Avatar        │
│                  │                                  │
│  Nav items       │  CONTENIDO                       │
│  (con íconos     │  (scroll vertical)               │
│   SVG creativos) │                                  │
│                  │                                  │
│  [spacer]        │                                  │
│  ─────────       │                                  │
│  Cerrar sesión   │                                  │
└─────────────────────────────────────────────────────┘
```

### Migas de pan — OBLIGATORIAS en TODAS las páginas

| Contexto       | Ejemplo                          |
|----------------|----------------------------------|
| Página raíz    | Política Digital › Inicio        |
| Sección        | Política Digital › Mi curso      |
| Sub-sección    | Mi curso › Módulo 2              |
| Nivel profundo | Mi curso › Módulo 2 › Lección 3  |
| Perfil tab     | Mi perfil › Mis badges           |
| Admin          | Admin › Cursos › Editar lección  |

### Sidebar — orden de items

**PRINCIPAL**

- Inicio
- Mi curso [badge con % progreso]
- Sesiones en vivo [badge si hay sesión hoy]
- Tareas [badge con pendientes]

**APRENDIZAJE**

- Comunidad
- Mi colega
- Mentores
- Egresados
- El Laboratorio
- Certificado

**CUENTA**

- Mi perfil

[spacer que empuja hacia abajo]  
──────────  
**Cerrar sesión** ← siempre visible al fondo, color danger

### Cerrar sesión

- Siempre visible al fondo del sidebar
- Color rojo (danger)
- Al hacer clic: modal de confirmación con botones "Cancelar" y "Cerrar sesión"
- Mensaje en el modal: "Tu progreso está guardado. Puedes regresar cuando quieras."

---

## 6. Íconos — sistema PlatformIcons.tsx

Usar **SIEMPRE** los íconos de `components/ui/icons/PlatformIcons.tsx`.  
**NUNCA** usar lucide-react para las secciones del sidebar de alumnos.  
Los admin panels pueden usar lucide para acciones (editar, borrar, etc.).

**Íconos disponibles:**  
IconInicio, IconCurso, IconSesiones, IconTareas, IconComunidad, IconMiColega, IconMentores, IconEgresados, IconCertificado, IconLaboratorio, IconSoporte, IconPerfil

**Props:** `size={18} active={boolean} accent="#00e5a0"`

---

## 7. Páginas especiales

### Dashboard — orden de secciones

1. Frase motivacional post-checkin (desaparece al hacer check-in, aparece frase)
2. Banner azul hero (frase del día + progreso)
3. Stats: Lecciones / Horas / Calificación / Racha (4 columnas)
4. Card "Tu siguiente paso" (borde azul, acción directa)
5. Grid 2 col: Tareas pendientes + Mis badges
6. Onboarding (5 pasos, solo primeras 2 semanas)

### Mi perfil — 6 tabs

1. Información (datos personales + institucionales)
2. Mis badges (grid sin explicación, solo badges con nombre y cómo ganarlos)
3. Carta al futuro (parcialmente visible según % progreso)
4. Notificaciones (toggles por canal)
5. Seguridad (contraseña, 2FA, último acceso)
6. Privacidad (cifrado, derechos, política, exportar/eliminar)

### El Laboratorio — acordeón

5 secciones como acordeón expandible:

- **Zona 1** — Juegos (Trivia, Adivina la política, Mitos y verdades)
- **Zona 2** — Creatividad (Generador de ideas, Rediseña un trámite)
- **Zona 3** — Exploración mundial (Mapa, Archivo secreto, Podcast)
- **Zona 4** — El Burocrátron (Roleplay, Muro de frases, Bingo)
- **Hablas humano** (destacado en azul, 5 modos + glosario)

### Fin de curso (/felicidades)

- Hero azul #1428d4 con confetti
- Logo Política Digital visible
- Stats finales
- Badges ganados
- Carta al yo futuro revelada completa
- 4 próximos pasos
- Compartir en 4 redes + copiar link (texto blanco sobre azul)

---

## 8. Responsive — mobile first

### Breakpoints

- **Mobile:** &lt; 640px
- **Tablet:** 640px – 1024px
- **Desktop:** &gt; 1024px

### En mobile

- Sidebar oculto → hamburger menu + drawer
- Migas de pan → solo el último nivel
- Stats → 2×2 en lugar de 4 columnas
- Cards → apiladas verticalmente
- Botones → ancho completo
- Neumorfismo → sombras 50% más suaves

---

## 9. Animaciones

```css
/* Todas las transiciones */
--transition-fast:  0.15s ease;
--transition-base:  0.2s ease;
--transition-slow:  0.35s ease;

/* Entrada de páginas */
@keyframes neu-enter {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.page-enter {
  animation: neu-enter 0.4s ease both;
}

/* Confetti (solo en /felicidades) */
/* Pop de badges al ganarlos */
@keyframes badge-pop {
  0%   { transform: scale(0.5); opacity: 0; }
  80%  { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}
```

---

## 10. Lo que NUNCA hacer

1. `border: 1px solid` en cards neumórficas
2. `background: white` o `background: #fff` en el dashboard
3. Fuentes serif en el dashboard (solo en el certificado PDF)
4. Emojis genéricos del sistema como íconos de navegación
5. Colores dorados (#b49130, #c9a83c) — reemplazados por verde menta
6. Fondo #e8ecf0 — reemplazado por #f0f2f5
7. Azul antiguo #1e3a8a — reemplazado por #1428d4
8. Gradientes decorativos sin propósito funcional
9. Sombras en el certificado PDF (es editorial, no neumórfico)
10. Neumorfismo en emails y notificaciones push (son planos por naturaleza)
