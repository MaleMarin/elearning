# 🎯 PROMPT CURSOR — ACCESIBILIDAD WCAG 2.1 AA
# ================================================================
# INSTRUCCIÓN CRÍTICA: Lee TODO antes de escribir una línea.
# ================================================================

## PASO 1 — LEE ESTOS ARCHIVOS PRIMERO

```
1. .cursorrules
2. docs/DESIGN_SYSTEM.md
3. app/inicio/page.tsx
4. app/globals.css
5. components/dashboard/DashboardShell.tsx
```

⛔ NO escribas código hasta confirmar. Responde "Archivos leídos ✓"

---

## CONTEXTO

Proyecto: Política Digital — plataforma para servidores públicos mexicanos
Objetivo: Cumplir WCAG 2.1 Nivel AA en todo el dashboard
NUNCA "cohorte" → "grupo" | NUNCA "badges" → "logros"
Los cambios de accesibilidad NO deben alterar el diseño visual neumórfico

---

## TAREA — IMPLEMENTAR WCAG 2.1 AA

### ÁREA 1 — Contraste de colores (1.4.3 AA — mínimo 4.5:1)

Los colores actuales que necesitan ajuste:
```
#8892b0 sobre #e8eaf0 → contraste ~2.8:1 ❌ (textos muted muy claros)
Solución: para texto importante usar #4a5580 mínimo
Para labels pequeños: aumentar font-weight a 600
```

Agregar en globals.css:
```css
/* Mejorar contraste en textos pequeños */
.text-accessible {
  color: #4a5580;
  font-weight: 500;
}

/* Focus visible para teclado */
*:focus-visible {
  outline: 3px solid #1428d4;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Remover outline solo en mouse, mantener en teclado */
*:focus:not(:focus-visible) {
  outline: none;
}
```

### ÁREA 2 — Navegación por teclado (2.1.1)

En app/inicio/page.tsx, agregar a todos los botones interactivos:
```tsx
// SIDEBAR: agregar tabIndex y onKeyDown
<button
  onClick={() => setActiveNav(item.key)}
  onKeyDown={(e) => e.key === 'Enter' && setActiveNav(item.key)}
  aria-label={item.label}
  aria-current={activeNav === item.key ? 'page' : undefined}
  tabIndex={0}
  ...
>

// CHECK-IN: agregar role y aria
<button
  role="radio"
  aria-checked={selectedMood === val}
  aria-label={label}
  ...
>

// Los botones de mood deben tener aria-label descriptivo
```

### ÁREA 3 — Roles ARIA semánticos (4.1.2)

```tsx
// Sidebar nav:
<aside role="navigation" aria-label="Menú principal">
  <nav>
    ...items...
  </nav>
</aside>

// Main:
<main role="main" aria-label="Dashboard del alumno">

// Panel derecho:
<aside role="complementary" aria-label="Información del alumno">

// Hero card:
<section aria-label="Bienvenida y progreso">

// Stats:
<section aria-label="Estadísticas del curso">
  <dl> {/* definición semántica de estadísticas */}
    <div>
      <dt>Lecciones completadas</dt>
      <dd>7 de 10</dd>
    </div>
    ...
  </dl>
</section>

// Check-in:
<section aria-label="Check-in de bienestar">
  <fieldset>
    <legend>¿Cómo llegaste hoy?</legend>
    ...botones...
  </fieldset>
</section>
```

### ÁREA 4 — Textos alternativos (1.1.1)

```tsx
// Todos los íconos SVG decorativos:
<svg aria-hidden="true" focusable="false" ...>

// Íconos con significado:
<svg role="img" aria-label="Lección completada" ...>

// Avatar del usuario:
<div role="img" aria-label={`Avatar de ${user.full_name}`} ...>

// Barra de progreso:
<div
  role="progressbar"
  aria-valuenow={68}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Progreso del curso: 68%"
  ...
>
```

### ÁREA 5 — Anuncios dinámicos (4.1.3 — ARIA live regions)

```tsx
// Al cambiar de pregunta en check-in o en check-in cognitivo:
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {selectedMood ? `Seleccionaste: ${selectedMood}` : ''}
</div>

// Al guardar notas:
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {notaSaved ? 'Nota guardada exitosamente' : ''}
</div>
```

Agregar en globals.css:
```css
/* Screen reader only — visible para lectores, oculto visualmente */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### ÁREA 6 — Tamaño mínimo de toque (2.5.5 — mínimo 44x44px)

```tsx
// Todos los botones del sidebar deben ser mínimo 44x44:
style={{ width: 46, height: 46, ... }}  // ✅ ya cumple

// Los botones de check-in en mobile:
style={{ minHeight: 44, ... }}

// Los días del calendario:
// En mobile, aumentar tamaño de celda
style={{ minWidth: 36, minHeight: 36, ... }}
```

### ÁREA 7 — Headings jerárquicos (1.3.1)

```tsx
// Asegurar jerarquía correcta en el dashboard:
// h1: "Política Digital" (único h1 por página)
// h2: secciones principales (Hero nombre, Stats, etc.)
// h3: subsecciones

// Hero:
<h1>Política Digital</h1>  // en el topbar
<h2>{user.full_name}</h2>  // en la hero card (nombre del alumno)

// Secciones:
<h3>Módulo 3 · Lecciones</h3>
<h3>Mis logros</h3>
<h3>Actividad reciente</h3>
<h3>Notificaciones</h3>
```

### ÁREA 8 — Reducción de movimiento (2.3.3)

Agregar en globals.css:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  /* Mantener el pulse del dot de seguridad pero más sutil */
  .sec-dot, [style*="animation: pulse"] {
    animation: none !important;
  }
}
```

---

## VERIFICACIÓN

### Herramientas a usar después de implementar:
```
1. axe DevTools (extensión Chrome) — escanear /inicio
2. Lighthouse → Accessibility → debe dar 90+
3. Tab navigation manual: todo debe ser accesible con Tab
4. VoiceOver (Mac) o NVDA (Windows): navegar con lector de pantalla
```

### Criterios WCAG 2.1 AA que deben pasar:
- [ ] 1.1.1 Contenido no textual — alt texts
- [ ] 1.3.1 Información y relaciones — roles semánticos
- [ ] 1.4.3 Contraste mínimo 4.5:1 en texto normal
- [ ] 1.4.11 Contraste de componentes UI 3:1
- [ ] 2.1.1 Teclado — todo navegable sin mouse
- [ ] 2.4.3 Orden de foco lógico
- [ ] 2.5.3 Label en nombre accesible
- [ ] 4.1.2 Nombre, función, valor en controles

---

## ✅ CHECKLIST FINAL

- [ ] `*:focus-visible` con outline azul agregado en globals.css
- [ ] `.sr-only` clase agregada en globals.css
- [ ] `@media (prefers-reduced-motion)` agregado
- [ ] Todos los SVG con `aria-hidden="true"` o `role="img"`
- [ ] Sidebar con `role="navigation"` y `aria-label`
- [ ] Main con `role="main"`
- [ ] Panel derecho con `role="complementary"`
- [ ] Barra de progreso con `role="progressbar"` y aria values
- [ ] Check-in con `fieldset` + `legend`
- [ ] Botones con `aria-label` descriptivos
- [ ] Lighthouse Accessibility ≥ 90
- [ ] TypeScript sin errores (`tsc --noEmit`)
- [ ] Diseño visual neumórfico NO alterado

Solo responde "✅ WCAG implementado" cuando todo esté confirmado.
