# Deploy Política Digital → Vercel

## Variables de entorno CRÍTICAS (sin estas no funciona)

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
JWT_SECRET=               ← mínimo 32 caracteres aleatorios
ARCJET_KEY=
NEXT_PUBLIC_DEMO_MODE=false
SESSION_SECRET=           ← mínimo 32 caracteres aleatorios
CRON_SECRET=              ← para el motor de reglas automáticas
```

## Variables opcionales pero recomendadas

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GOOGLE_DRIVE_PDF_FOLDER_ID=
GOOGLE_APPLICATION_CREDENTIALS=
DAILY_API_KEY=
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
```

## Pasos en Vercel

1. vercel.com → New Project → Importar repo GitHub
2. Framework: Next.js (detectado auto)
3. Build Command: `DISABLE_PWA=1 NODE_OPTIONS=--max-old-space-size=4096 npm run build`  
   (Copia exacta: **PWA** no "PMA". DISABLE_PWA=1 evita fallo de Terser con el plugin PWA.)
4. Node.js Version (Settings → General): **20.x** recomendado (evitar 24.x con Next 14).
5. Settings → Environment Variables → agregar todas las de arriba.
6. Deploy → esperar 3-4 minutos.
7. Verificar: /inicio, /admin/login, /login.

## Post-deploy

- Actualizar Firebase Auth → Authorized domains → agregar dominio Vercel
- Verificar Firestore Rules están desplegadas
- Probar login con usuario demo

## Warnings en build (amarillo)

- **Sentry:** "No auth token / No project" → opcional. Para releases y source maps: configurar `authToken` y `project` en el plugin Sentry.
- **npm deprecated / glob / next:** Actualizar dependencias cuando se pueda (`npm update`, y Next a una versión parcheada si hay aviso de seguridad).
- **Webpack cache:** "Caching failed" / "Serializing big strings" → no bloquean el deploy.

## Comandos útiles pre-deploy

```bash
./scripts/check-deploy.sh
DISABLE_PWA=1 NODE_OPTIONS=--max-old-space-size=4096 npm run build
npx tsc --noEmit
```
