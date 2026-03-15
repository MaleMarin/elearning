#!/bin/bash
echo "🔑 Generando secretos seguros para Vercel..."
echo ""
echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "SESSION_SECRET=$(openssl rand -base64 32)"
echo "CRON_SECRET=$(openssl rand -base64 24)"
echo ""
echo "Copia estas variables en Vercel → Settings → Environment Variables"
