# Qué hacer con lo que ves en Vercel (build en cola y warnings)

## 1. "Another build is in progress" / "Queued Latest"

**Qué significa:** Solo puede ejecutarse un build a la vez en el plan gratuito. Tu nuevo deploy está en cola y empezará cuando termine el que está corriendo.

**Qué hacer:**
- **Esperar** unos minutos. Cuando el otro build termine, el tuyo pasará a "Building" y luego "Ready".
- No hace falta cancelar nada; el deploy del commit `fdd4d94` se hará solo.
- Si quieres evitar colas en el futuro: plan **Pro** permite builds en paralelo (On-Demand Concurrent Builds).

---

## 2. Warnings en los Build Logs (amarillo)

### 2.1 Next.js – vulnerabilidad de seguridad

**Mensaje:** `next@14.2.18: This version has a security vulnerability. Please upgrade to a patched version.`

**Qué hacer:** Actualizar Next.js a una versión parcheada (por ejemplo 14.2.35):

```bash
npm install next@14.2.35
```

Luego commit y push para que el próximo deploy use la versión nueva.

### 2.2 Otros paquetes deprecados (glob, inflight, source-map, etc.)

**Qué significa:** Son avisos de paquetes antiguos o con alternativas recomendadas. No suelen tumbar el build.

**Qué hacer:**
- A corto plazo: **nada**; el deploy puede seguir en verde.
- A medio plazo: `npm update` y, si quieres, ir reemplazando dependencias que marquen como deprecadas o con vulnerabilidades.

### 2.3 ".npmignore not found"

**Qué hacer:** Opcional. Si quieres quitar el aviso, puedes crear un `.npmignore` en la raíz del proyecto (por ejemplo dejando solo lo que no quieres publicar en npm; en Vercel no es obligatorio).

---

## Resumen

| Lo que ves | Acción |
|------------|--------|
| "Queued Latest" / "Another build is in progress" | Esperar; el build se ejecutará cuando toque. |
| next@14.2.18 security vulnerability | Ejecutar `npm install next@14.2.35` y hacer commit + push. |
| npm warn deprecated (glob, inflight, etc.) | Opcional: más adelante `npm update` o cambiar dependencias. |
| No .npmignore | Opcional: crear `.npmignore` si quieres. |
