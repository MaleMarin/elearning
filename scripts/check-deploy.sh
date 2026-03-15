#!/bin/bash
echo "🔍 Verificando proyecto para deploy..."
echo ""

echo "1. TypeScript..."
npx tsc --noEmit && echo "✅ TypeScript OK" || echo "❌ Errores TypeScript"

echo ""
echo "2. Build de producción..."
DISABLE_PWA=1 NODE_OPTIONS=--max-old-space-size=4096 npm run build && echo "✅ Build OK" || echo "❌ Error en build"

echo ""
echo "3. Variables de entorno (requeridas para producción)..."
required=("NEXT_PUBLIC_FIREBASE_API_KEY" "NEXT_PUBLIC_FIREBASE_PROJECT_ID")
for var in "${required[@]}"; do
  if [ -z "${!var}" ]; then
    echo "⚠️  Falta: $var"
  else
    echo "✅ $var configurada"
  fi
done
if [ -z "${OPENAI_API_KEY}" ] && [ -z "${ANTHROPIC_API_KEY}" ]; then
  echo "⚠️  Falta al menos uno: OPENAI_API_KEY o ANTHROPIC_API_KEY"
else
  echo "✅ Algún LLM API key configurado"
fi
if [ -z "${SESSION_SECRET}" ] && [ -z "${JWT_SECRET}" ]; then
  echo "⚠️  Falta: SESSION_SECRET o JWT_SECRET"
else
  echo "✅ Sesión/JWT configurado"
fi

echo ""
echo "✅ Verificación completa"
