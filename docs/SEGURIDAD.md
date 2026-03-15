# Seguridad – Plataforma E-learning Precisar

## Resumen

La plataforma aplica buenas prácticas de seguridad en autenticación, cookies, APIs y contenido. En **producción** es importante configurar correctamente las variables de entorno y no usar modo demo.

---

## Lo que está bien implementado

### 1. **Cookie de sesión**
- **Nombre:** `precisar_session`
- **Opciones:** `httpOnly`, `secure` en producción, `sameSite: "lax"`, `path: "/"`
- **Demo:** payload firmado con HMAC-SHA256; no se puede falsificar sin `SESSION_SECRET`
- **Producción:** se exige `SESSION_SECRET` de al menos 32 caracteres (sin fallback débil)

### 2. **Autenticación**
- Rutas privadas protegidas en **middleware**: sin cookie válida → redirect a login
- **APIs** que usan datos sensibles validan sesión con `getAuthFromRequest()` (cookie verificada con Firebase o demo)
- Admin/panel exigen sesión; el rol se valida en servidor (cookie demo o Firebase + Firestore)

### 3. **Contenido dinámico (XSS)**
- Contenido de lecciones (markdown) se convierte con `simpleMarkdownToHtml`: primero se **escapa** HTML y solo se permiten etiquetas seguras (`<strong>`, `<p>`, `<br />`)
- El CSS crítico en layout es una constante en código, no entrada de usuario

### 4. **Redirect tras login**
- El parámetro `?redirect=...` se valida: solo se aceptan rutas **internas** que empiezan por `/` y no por `//`, para evitar redirecciones a dominios externos (open redirect)

### 5. **Variables de entorno**
- Secretos solo en servidor: `SESSION_SECRET`, `FIREBASE_SERVICE_ACCOUNT_JSON`, etc.
- En cliente solo se usan `NEXT_PUBLIC_*` (p. ej. keys públicas de Firebase)

---

## Qué debes hacer en producción

1. **No usar modo demo**
   - `NEXT_PUBLIC_DEMO_MODE` debe ser `false` o no definido.
   - Con demo activo, el login acepta cualquier correo/contraseña y las APIs pueden devolver datos sin validar sesión.

2. **SESSION_SECRET**
   - Al menos 32 caracteres.
   - Generar con: `openssl rand -base64 32`

3. **Firebase**
   - `FIREBASE_SERVICE_ACCOUNT_JSON` con el JSON de la cuenta de servicio (solo en servidor).
   - No subir este archivo a Git; usar variables de entorno del hosting.

4. **HTTPS**
   - En producción la cookie se marca `secure`; el sitio debe servirse por HTTPS.

5. **Revisar rutas admin**
   - Las páginas bajo `/admin` y `/panel` deben seguir validando rol en servidor (layout o API), ya que el middleware solo comprueba sesión para Firebase (no lee rol desde la cookie).

---

## Limitaciones conocidas

- **Middleware:** no aplica auth a rutas `/api/*`; cada API que deba ser privada debe comprobar sesión internamente (dashboard, progress, curso, etc. lo hacen).
- **Modo demo:** pensado solo para desarrollo/demos; no usarlo en producción con datos reales.
