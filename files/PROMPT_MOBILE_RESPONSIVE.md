# 🎯 PROMPT CURSOR — MOBILE RESPONSIVE
# ================================================================
# INSTRUCCIÓN CRÍTICA: Lee TODO antes de escribir una línea.
# ================================================================

## PASO 1 — LEE ESTOS ARCHIVOS PRIMERO

```
1. .cursorrules
2. docs/DESIGN_SYSTEM.md
3. app/inicio/page.tsx
4. components/dashboard/DashboardShell.tsx
5. app/globals.css
```

⛔ NO escribas código hasta confirmar. Responde "Archivos leídos ✓"

---

## CONTEXTO

Proyecto: Política Digital — Next.js 14 + Tailwind + TypeScript
El dashboard actual tiene layout 3 columnas fijas (72px + flex + 240px).
En móvil (< 768px) esto no funciona. Hay que hacerlo responsive.
NUNCA "cohorte" → "grupo" | NUNCA "badges" → "logros"
Colores SIEMPRE style={{}} inline — NUNCA clases Tailwind para colores

Breakpoints a usar:
- Mobile:  < 768px
- Tablet:  768px – 1024px
- Desktop: > 1024px

---

## TAREA — HACER RESPONSIVE EL DASHBOARD

### Comportamiento por breakpoint:

#### MOBILE (< 768px):
```
- Sidebar izquierdo: OCULTO → reemplazado por bottom nav de 5 íconos
- Panel derecho: OCULTO → accesible via botón/tab en header
- Main content: ancho completo (100vw)
- Header: compacto, sin fecha larga (solo día/hora)
- Hero card: padding reducido, texto más pequeño
- Stats: grid 2x2 en lugar de 4 columnas
- Check-in: botones en 2x2 grid
- Lecciones + Logros: stack vertical (1 columna)
- Bottom nav fijo: Inicio | Curso | Tareas | Comunidad | Perfil
```

#### TABLET (768px – 1024px):
```
- Sidebar izquierdo: VISIBLE (72px) sin tooltips
- Panel derecho: OCULTO → botón en header para abrir como drawer
- Main content: ancho completo menos sidebar
- Stats: 4 columnas (igual que desktop)
- Lecciones + Logros: 2 columnas (igual que desktop)
```

#### DESKTOP (> 1024px):
```
- Todo visible: sidebar 72px + main + panel derecho 240px
- Comportamiento actual sin cambios
```

---

## IMPLEMENTACIÓN

### A) Agregar en app/globals.css:

```css
/* ── Mobile responsive ── */
@media (max-width: 767px) {
  .sidebar-left  { display: none !important; }
  .panel-right   { display: none !important; }
  .panel-right.open { display: flex !important; }
  .bottom-nav    { display: flex !important; }
  .main-content  { padding: 14px 12px 80px !important; }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .panel-right   { display: none !important; }
  .panel-right-btn { display: flex !important; }
  .bottom-nav    { display: none !important; }
}

@media (min-width: 1024px) {
  .bottom-nav    { display: none !important; }
  .panel-right-btn { display: none !important; }
}
```

### B) Modificar app/inicio/page.tsx:

Agregar clases CSS a los elementos existentes:

```tsx
// El aside izquierdo: agregar className="sidebar-left"
<aside className="sidebar-left flex flex-col..." ...>

// El main: agregar className="main-content"
<main className="main-content flex-1..." ...>

// El aside derecho: agregar className="panel-right"
<aside className="panel-right flex-shrink-0..." ...>
```

### C) Agregar bottom nav para mobile:

```tsx
// Componente BottomNav — agregar al final del JSX, antes del cierre del div root:

function BottomNav({ active, onChange }: { active: NavKey; onChange: (k: NavKey) => void }) {
  const items = [
    { key: 'inicio' as NavKey,      icon: <IcoGrid />,  label: 'Inicio' },
    { key: 'curso' as NavKey,       icon: <IcoBook />,  label: 'Curso' },
    { key: 'tareas' as NavKey,      icon: <IcoCheck />, label: 'Tareas' },
    { key: 'comunidad' as NavKey,   icon: <IcoUsers />, label: 'Comunidad' },
    { key: 'laboratorio' as NavKey, icon: <IcoLab />,   label: 'Lab' },
  ]
  return (
    <nav
      className="bottom-nav"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#e8eaf0',
        padding: '10px 0 20px',
        display: 'none', // controlado por CSS media query
        justifyContent: 'space-around',
        alignItems: 'center',
        boxShadow: '0 -4px 16px #c2c8d6, 0 -1px 4px #ffffff',
        zIndex: 40,
      }}
    >
      {items.map(item => (
        <button
          key={item.key}
          onClick={() => onChange(item.key)}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 3, padding: '6px 14px', borderRadius: 12, border: 'none',
            cursor: 'pointer', fontFamily: "'Syne', sans-serif",
            background: active === item.key ? 'rgba(20,40,212,0.06)' : 'transparent',
            color: active === item.key ? '#1428d4' : '#8892b0',
            boxShadow: active === item.key
              ? 'inset 2px 2px 6px #c2c8d6, inset -2px -2px 6px #ffffff'
              : 'none',
          }}
        >
          {item.icon}
          <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  )
}
```

### D) Adaptar Hero card para mobile:

```tsx
// En la hero card, hacer el padding responsive:
style={{
  padding: 'clamp(16px, 4vw, 22px) clamp(16px, 4vw, 24px)',
  // ...resto igual
}}

// El nombre del alumno:
style={{ fontSize: 'clamp(15px, 4vw, 20px)', ... }}
```

### E) Stats responsive (de 4 cols a 2x2 en mobile):

```tsx
// Cambiar className del grid de stats:
className="grid gap-2 mb-4"
style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}
// Esto automáticamente hace 2x2 en mobile y 4 en desktop
```

### F) Botón para abrir panel derecho en tablet/mobile:

```tsx
// Agregar en el topbar, después del botón de notificaciones:
<button
  className="panel-right-btn"
  onClick={() => setShowRightPanel(!showRightPanel)}
  style={{
    display: 'none', // controlado por media query
    width: 40, height: 40, borderRadius: 12, border: 'none',
    cursor: 'pointer', background: '#e8eaf0',
    boxShadow: '4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff',
    color: '#1428d4', alignItems: 'center', justifyContent: 'center',
  }}
>
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
</button>
```

---

## ✅ CHECKLIST FINAL

- [ ] En mobile (< 768px): sidebar izquierdo oculto
- [ ] En mobile: bottom nav visible con 5 íconos
- [ ] En mobile: panel derecho oculto (accesible via botón)
- [ ] En mobile: stats en grid 2x2
- [ ] En tablet (768-1024px): sidebar visible, panel derecho oculto
- [ ] En desktop (> 1024px): todo visible, igual que antes
- [ ] Hero card con padding clamp()
- [ ] TypeScript sin errores (`tsc --noEmit`)
- [ ] NUNCA "cohorte" → "grupo"
- [ ] NUNCA "badges" → "logros"

Solo responde "✅ Mobile responsive implementado" cuando todo esté confirmado.
