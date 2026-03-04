# Subir a GitHub y desplegar en Vercel

El proyecto ya tiene Git iniciado y un commit inicial. Sigue estos pasos.

---

## 1. Crear el repositorio en GitHub

1. Entra en **https://github.com/new**
2. **Repository name:** por ejemplo `elearning-precisar`
3. Elige **Private** o **Public**
4. **No** marques "Add a README" (ya tienes uno en el proyecto)
5. Clic en **Create repository**

---

## 2. Conectar y subir (push)

En la terminal, desde la carpeta del proyecto:

```bash
cd "/Users/malehofmann/Documents/2026/precisar-2026/proyectos-cursor/elearning Precisar"

# Sustituye TU_USUARIO y NOMBRE_REPO por los tuyos (ej: malehofmann, elearning-precisar)
git remote add origin https://github.com/TU_USUARIO/NOMBRE_REPO.git

git branch -M main
git push -u origin main
```

Si GitHub te pide autenticación, usa un **Personal Access Token** (Settings → Developer settings → Personal access tokens) como contraseña, o configura SSH.

---

## 3. Desplegar en Vercel

### Opción A: Desde la web (recomendado)

1. Entra en **https://vercel.com** e inicia sesión (con GitHub si quieres).
2. **Add New…** → **Project**
3. **Import** el repositorio `elearning-precisar` (o el nombre que hayas usado).
4. Vercel detecta Next.js; deja **Build Command** y **Output Directory** por defecto.
5. **Environment Variables:** añade las que uses en producción, por ejemplo:
   - `NEXT_PUBLIC_DEMO_MODE` = `true` (para ver la app sin Supabase)
   - O las de Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. **Deploy**

Cada `git push` a `main` generará un nuevo despliegue.

### Opción B: Con Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

Sigue las preguntas (link a proyecto existente o crear uno nuevo). Luego, para producción:

```bash
vercel --prod
```

---

## Variables de entorno en Vercel

En el proyecto (Vercel → Project → Settings → Environment Variables) configura al menos:

| Variable | Uso |
|----------|-----|
| `NEXT_PUBLIC_DEMO_MODE` | `true` = modo demo sin Supabase |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase (modo real) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase (modo real) |

Con `NEXT_PUBLIC_DEMO_MODE=true` la app funciona en Vercel sin base de datos.
