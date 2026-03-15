# Estructura del proyecto — Política Digital
# Este archivo es la fuente de verdad de la arquitectura.
# Cursor debe leerlo ANTES de crear o mover cualquier archivo.
# Ruta: docs/PROJECT_STRUCTURE.md

---

## Regla de oro
Antes de crear un archivo nuevo, verificar que no existe ya.
Antes de mover un archivo, actualizar todos los imports.
Nunca crear duplicados.

---

## Layout y AppShell

- **app/layout.tsx** (root) envuelve toda la app en **ConditionalLayout**.
- **ConditionalLayout** (client) usa `usePathname()`:
  - Rutas `/login`, `/registro`, `/no-inscrito` → sin shell (standalone).
  - Rutas que empiezan por `/admin` → **AdminShell** (sidebar azul).
  - **Resto de rutas** → **AppShell** (sidebar + topbar del alumno).
- No existe `app/(app)/layout.tsx`. El shell del alumno se aplica por pathname, no por carpeta.

---

## Estructura de carpetas

```
elearningPD/
├── app/
│   ├── layout.tsx            ← Root: ConditionalLayout aplica AppShell o AdminShell
│   ├── page.tsx              ← Redirige a /inicio
│   │
│   ├── inicio/               ← Dashboard del alumno (ruta /inicio)
│   │   └── page.tsx
│   ├── curso/                ← Mi curso, módulos, lecciones
│   │   ├── page.tsx
│   │   ├── lecciones/[lessonId]/page.tsx
│   │   ├── modulos/[moduleId]/page.tsx
│   │   ├── evaluacion-final/page.tsx
│   │   ├── quiz/[quizId]/page.tsx
│   │   └── taller/[workshopId]/page.tsx
│   ├── sesiones/             ← Sesiones en vivo
│   │   └── page.tsx
│   ├── tareas/
│   │   └── page.tsx
│   ├── comunidad/
│   │   └── page.tsx
│   ├── mi-colega/
│   │   └── page.tsx
│   ├── mentores/
│   │   └── page.tsx
│   ├── egresados/
│   │   └── page.tsx
│   ├── certificado/
│   │   └── page.tsx
│   ├── laboratorio/
│   │   └── page.tsx (+ zonas)
│   ├── portafolio/
│   │   ├── page.tsx
│   │   └── galeria/page.tsx
│   ├── simulador/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── reto/[id]/
│   │   └── page.tsx
│   ├── soporte/
│   │   └── page.tsx
│   ├── perfil/
│   │   └── page.tsx
│   │
│   ├── admin/                ← Rutas del ADMINISTRADOR (AdminShell)
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── page.tsx
│   │   ├── cursos/
│   │   ├── alumnos/
│   │   ├── cohortes/
│   │   ├── certificados/
│   │   ├── notificaciones/
│   │   ├── analytics/
│   │   └── ...
│   │
│   ├── onboarding/
│   │   ├── page.tsx
│   │   └── diagnostic/page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── registro/
│   │   └── page.tsx
│   ├── verificar/[idCert]/page.tsx
│   ├── felicidades/page.tsx
│   ├── panel/                ← Panel interno (layout propio)
│   ├── superadmin/           ← Multi-tenant (layout propio)
│   │
│   └── api/                  ← API Routes (solo servidor)
│       ├── auth/
│       ├── home/
│       ├── admin/
│       └── ...
│
├── components/
│   ├── layout/
│   │   ├── ConditionalLayout.tsx  ← Decide AppShell vs AdminShell vs standalone
│   │   ├── AppShell.tsx           ← Shell del alumno (sidebar + topbar)
│   │   ├── Sidebar.tsx
│   │   ├── AdminShell.tsx
│   │   └── AdminSidebar.tsx
│   ├── ui/
│   ├── dashboard/
│   ├── lessons/
│   └── ...
│
├── lib/
│   ├── firebase/
│   ├── auth/
│   ├── services/
│   └── ...
│
├── docs/
│   ├── DESIGN_SYSTEM.md
│   ├── PROJECT_STRUCTURE.md  ← Este archivo
│   └── ...
│
└── public/
```

---

## Rutas del sidebar del alumno → archivos

| Sidebar item   | Ruta URL   | Archivo              |
|----------------|------------|----------------------|
| Inicio         | /inicio    | app/inicio/page.tsx  |
| Mi curso       | /curso     | app/curso/page.tsx   |
| Sesiones en vivo | /sesiones | app/sesiones/page.tsx |
| Tareas         | /tareas    | app/tareas/page.tsx  |
| Comunidad      | /comunidad | app/comunidad/page.tsx |
| Mi colega      | /mi-colega | app/mi-colega/page.tsx |
| Mentores       | /mentores  | app/mentores/page.tsx |
| Egresados      | /egresados | app/egresados/page.tsx |
| El Laboratorio | /laboratorio | app/laboratorio/page.tsx |
| Certificado    | /certificado | app/certificado/page.tsx |
| Portafolio     | /portafolio | app/portafolio/page.tsx |
| Soporte        | /soporte   | app/soporte/page.tsx |
| Mi perfil      | /perfil    | app/perfil/page.tsx  |

---

## Lo que NO hacer

1. Nunca importar `lib/firebase/admin` en componentes cliente
2. Nunca usar `localStorage` en Server Components
3. Nunca crear componentes de UI en `app/` — van en `components/`
4. Nunca crear lógica de negocio en componentes — va en `lib/services/`
5. Nunca duplicar páginas (p. ej. mismo contenido en dos rutas)
6. Nunca poner estilos inline en Server Components sin `"use client"`

---

## Cómo verificar antes de crear un archivo

```bash
find . -name "*.tsx" | grep -i "inicio"
find . -name "*.tsx" | grep -i "dashboard"
ls app/
ls components/
```
