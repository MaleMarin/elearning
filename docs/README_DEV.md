# README DEV — ELEARNING PRECISAR (Local)

**Contrato obligatorio:** [CURSOR_RULES.md](./CURSOR_RULES.md) (gana sobre cualquier ticket).

---

## 1) Levantar servidor (puerto fijo)

En la carpeta del proyecto:

```bash
npm run dev
```

- El servidor queda en **http://localhost:3000** (puerto fijo).
- Si el 3000 está ocupado: `npm run dev:fresh` (libera el puerto y arranca) o `npm run dev:any` (usa otro puerto).

---

## 2) 401 en `/api/auth/me`

- Es **normal** hasta que el usuario haga login (o esté en modo demo).
- Las rutas protegidas redirigen a `/login` cuando no hay sesión válida.

---

## 3) ChunkLoadError / Webpack

Si aparece **ChunkLoadError** o avisos de webpack al cargar:

1. Parar el servidor (Ctrl+C).
2. Limpiar caché y arrancar de nuevo:

   ```bash
   rm -rf .next && npm run dev
   ```

3. En el navegador: recarga forzada (Cmd+Shift+R en Mac, Ctrl+Shift+R en Windows/Linux) o abre de nuevo http://localhost:3000.

---

## 4) Variables `.env.local` (Firebase)

Para modo real (no demo), en la raíz del proyecto debe existir `.env.local` con al menos:

| Variable | Uso |
|----------|-----|
| `NEXT_PUBLIC_DEMO_MODE` | `true` = modo demo (datos placeholder, login sin Firebase). `false` = modo real con Firebase. |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Clave pública de Firebase (Configuración del proyecto > Tus apps). |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ID del proyecto Firebase. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Dominio de Auth (ej. `tu-proyecto.firebaseapp.com`). |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | JSON de la cuenta de servicio (API routes con firebase-admin). |

Para **solo ver la app en local** sin backend real: `NEXT_PUBLIC_DEMO_MODE=true` y el resto opcional. Reiniciar `npm run dev` después de cambiar `.env.local`.

---

## 5) Rutas locales de referencia

- **Inicio (alumno):** http://localhost:3000/inicio  
- **Login:** http://localhost:3000/login  
- **Curso:** http://localhost:3000/curso  
- **Admin cursos:** http://localhost:3000/admin/cursos  
- **Admin cohortes:** http://localhost:3000/admin/cohortes  
