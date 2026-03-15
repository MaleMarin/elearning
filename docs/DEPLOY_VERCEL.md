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
   (DISABLE_PWA=1 evita fallo de Terser con el plugin PWA; opcional: activar PWA en runtime con variable sin DISABLE_PWA.)
4. Settings → Environment Variables → agregar todas las de arriba
5. Deploy → esperar 3-4 minutos
6. Verificar: /inicio, /admin/login, /login

## Post-deploy

- Actualizar Firebase Auth → Authorized domains → agregar dominio Vercel
- Verificar Firestore Rules están desplegadas
- Probar login con usuario demo

## Comandos útiles pre-deploy

```bash
./scripts/check-deploy.sh
DISABLE_PWA=1 NODE_OPTIONS=--max-old-space-size=4096 npm run build
npx tsc --noEmit
```
