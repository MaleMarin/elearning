# Instrucciones de integración — Dashboard Política Digital

## 1. Reemplazar el archivo principal

Copia `page.tsx` a:
```
app/inicio/page.tsx
```

## 2. Agregar las fuentes en layout.tsx

En tu `app/layout.tsx`, importa las fuentes de Google:

```tsx
import { Syne, Space_Mono } from 'next/font/google'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
})

// En el <html> o <body>:
// className={`${syne.variable} ${spaceMono.variable}`}
```

O si prefieres sin next/font, agrega en `app/layout.tsx`:

```tsx
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap"
/>
```

## 3. Animación del punto de seguridad

Agrega este keyframe en tu `globals.css`:

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
```

## 4. Tailwind — clases usadas

El componente usa clases estándar de Tailwind:
- `flex`, `flex-col`, `grid`, `grid-cols-2`, `grid-cols-3`
- `items-center`, `justify-between`, `gap-2`, `gap-3`
- `w-full`, `min-w-0`, `flex-1`, `flex-shrink-0`
- `relative`, `absolute`, `overflow-hidden`, `overflow-y-auto`
- `mb-3`, `mb-4`, `p-5`, `py-6`

No se requieren plugins adicionales de Tailwind.

## 5. TypeScript

0 errores. Todos los tipos están definidos en el mismo archivo.
No se requieren dependencias externas.

## 6. Datos dinámicos (próximo paso)

Los datos actualmente están hardcodeados como constantes.
Para conectar con Firebase, reemplaza las constantes por hooks:

```tsx
// Ejemplo con Firebase
const { data: alumno } = useAlumno(userId)
const { data: progreso } = useProgreso(cursoId, userId)
```

Los componentes `HeroCard`, `StatCard`, `LessonesPanel` etc.
ya reciben props, facilitando la conexión a datos reales.
