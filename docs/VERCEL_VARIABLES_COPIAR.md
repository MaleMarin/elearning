# Variables de Vercel – copiar y pegar

En **Vercel** → tu proyecto **elearning** → **Settings** → **Environment Variables** añade cada variable. En "Key" pega el nombre; en "Value" pega el valor. Marca **Production**, **Preview** y **Development** si quieres que aplique en todos los entornos.

---

## Modo demo (para poder entrar con email sin Firebase)

Si quieres que el login funcione en **modo demo** (entrar con un email, sin Firebase), necesitas estas dos:

**Variable 1 – Activar modo demo**

```
NEXT_PUBLIC_DEMO_MODE
```

```
true
```

**Variable 2 – Secret para la cookie de sesión demo (mínimo 32 caracteres)**

```
DEMO_SESSION_SECRET
```

```
cambiar-por-32-caracteres-aleatorios-minimo
```

Generar un valor seguro en la terminal (copiar la salida y pegarla como valor):

```
openssl rand -base64 32
```

O usar este ejemplo (sustituir por uno propio en producción):

```
precisar-demo-secret-2026-elearning-min32chars
```

---

## Listado completo – nombre y valor por línea (copiar cada bloque)

### Críticas (sin estas el sitio no funciona o el build falla)

**Nombre**
```
NEXT_PUBLIC_FIREBASE_API_KEY
```
**Valor** (pon el tuyo de Firebase Console)
```
AIza...
```

---

**Nombre**
```
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
```
**Valor**
```
tu-proyecto.firebaseapp.com
```

---

**Nombre**
```
NEXT_PUBLIC_FIREBASE_PROJECT_ID
```
**Valor**
```
tu-proyecto-id
```

---

**Nombre**
```
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
```
**Valor**
```
tu-proyecto.appspot.com
```

---

**Nombre**
```
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
```
**Valor**
```
123456789012
```

---

**Nombre**
```
NEXT_PUBLIC_FIREBASE_APP_ID
```
**Valor**
```
1:123456789012:web:abc123...
```

---

**Nombre**
```
OPENAI_API_KEY
```
**Valor**
```
sk-...
```

---

**Nombre**
```
ANTHROPIC_API_KEY
```
**Valor**
```
sk-ant-...
```

---

**Nombre**
```
JWT_SECRET
```
**Valor** (mínimo 32 caracteres)
```
tu-jwt-secret-minimo-32-caracteres
```

---

**Nombre**
```
ARCJET_KEY
```
**Valor**
```
tu-clave-arcjet
```

---

**Nombre**
```
NEXT_PUBLIC_DEMO_MODE
```
**Valor** (para modo demo usar `true`, para producción con Firebase usar `false`)
```
true
```

---

**Nombre**
```
SESSION_SECRET
```
**Valor** (mínimo 32 caracteres; si usas demo, puede ser el mismo que DEMO_SESSION_SECRET)
```
tu-session-secret-minimo-32-caracteres
```

---

**Nombre**
```
CRON_SECRET
```
**Valor**
```
tu-cron-secret
```

---

### Opcionales

**Nombre**
```
NEXT_PUBLIC_SUPABASE_URL
```
**Valor**
```
https://xxx.supabase.co
```

---

**Nombre**
```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
**Valor**
```
eyJ...
```

---

**Nombre**
```
DEMO_SESSION_SECRET
```
**Valor** (solo si usas modo demo; mínimo 32 caracteres)
```
precisar-demo-secret-2026-elearning-min32chars
```

---

## Build Command (copiar tal cual)

```
DISABLE_PWA=1 NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

---

## Después de cambiar variables

En Vercel → **Deployments** → menú del último deployment → **Redeploy** para que carguen las nuevas variables.
