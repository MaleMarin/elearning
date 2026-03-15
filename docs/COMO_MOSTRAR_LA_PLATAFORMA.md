# Cómo mostrar la plataforma (demo)

Instrucciones para levantar y presentar la plataforma e-learning Política Digital.

---

## 1. Requisitos

- Node.js 18+
- Cuenta en el proyecto (repo clonado)

---

## 2. Levantar la plataforma

En la raíz del proyecto:

```bash
npm install
npm run dev
```

El servidor queda en **http://localhost:3000**.

Si el puerto 3000 está ocupado:

```bash
npm run dev:fresh
```

---

## 3. Rutas para mostrar (en orden sugerido)

| Orden | URL | Qué mostrar |
|-------|-----|-------------|
| 1 | http://localhost:3000 | Redirige a /inicio |
| 2 | http://localhost:3000/inicio | Dashboard: saludo, siguiente acción, progreso, sesiones/tareas/módulos |
| 3 | http://localhost:3000/curso | Curso: módulos en cards, lecciones con badge Completado/Pendiente y duración |
| 4 | http://localhost:3000/curso/lecciones/[id] | Lección: barra de progreso, contenido, Anterior/Siguiente, “Marcar como completada” |
| 5 | http://localhost:3000/login | Login: AuthCard, inputs altos, mensajes de error humanos |
| 6 | http://localhost:3000/registro | Registro: mismo estándar premium |
| 7 | http://localhost:3000/sesiones-en-vivo | Listado o EmptyState “Todavía no hay sesiones en vivo” |
| 8 | http://localhost:3000/comunidad | Comunidad o EmptyState guía |
| 9 | http://localhost:3000/certificado | Certificado o EmptyState “Tu certificado aparecerá cuando completes el programa” |

**Panel derecho (visible en Inicio/Curso):** Progreso, Comunidad, Próxima sesión.

**Sidebar:** Logo Política Digital (negro) + “Innovación Pública”, navegación, perfil/cerrar sesión.

---

## 4. Modo demo (sin backend real)

Si usas **modo demo** (variable `NEXT_PUBLIC_DEMO_MODE=true` en `.env.local`):

- Login acepta cualquier correo y contraseña.
- Tras entrar verás datos de ejemplo (curso, lecciones, progreso).
- No se usa Firebase real; la sesión es cookie de demo.

Para activar modo demo, en la raíz del proyecto crea o edita `.env.local`:

```env
NEXT_PUBLIC_DEMO_MODE=true
DEMO_SESSION_SECRET=tu-clave-secreta-de-al-menos-32-caracteres
DEMO_ADMIN_EMAIL=admin@demo.com
DEMO_ADMIN_PASSWORD=demo123
```

**Cómo entrar en modo demo:**

| Rol | Dónde | Credenciales |
|-----|--------|--------------|
| **Alumno** | Ir a **/login** | Cualquier correo y cualquier contraseña (ej. `alumno@demo.com` / `demo123`). Pulsar "Ingresar" → redirige a `/inicio`. |
| **Administrador** | Ir a **/admin/login** | En demo: **admin@demo.com** / **demo123**. Pulsar "Ingresar" → redirige a `/admin`. |

Desde la pantalla de login de alumnos (/login) hay un enlace: *"¿Eres administrador? Ingresa aquí"* que lleva a /admin/login.

Reinicia el servidor después de cambiar `.env.local`:

```bash
npm run dev
```

---

## 5. Guion rápido para presentar (2–3 min)

1. Abrir **http://localhost:3000** → “Redirige al inicio.”
2. **Inicio:** “Aquí el alumno ve su siguiente acción y el progreso del curso.”
3. **Curso:** “Módulos por dominios, lecciones en orden lineal con duración estimada.”
4. **Lección:** “Barra de progreso, contenido en modo lectura, navegación Anterior/Siguiente y marcar completada.”
5. **Login:** “Pantalla de acceso con mensajes claros si hay error.”
6. Opcional: mostrar **EmptyStates** (sesiones, comunidad, certificado) para explicar que no dejamos al usuario sin guía.

---

## 6. Build para producción (opcional)

Para generar una build lista para desplegar:

```bash
npm run build
npm run start
```

La app quedará en http://localhost:3000 con la build de producción.

---

*Plataforma: Política Digital — E-learning. Stack: Next.js (App Router), Firebase (Auth + Firestore), UI Kit propio.*
