/**
 * Rate limit in-memory por identificador (ej. user_id).
 * En producción con múltiples instancias usar Redis/Vercel KV.
 */

const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_PER_WINDOW = 30;   // máx solicitudes por ventana

export function checkRateLimit(key: string): { ok: boolean; remaining: number } {
  const now = Date.now();
  let entry = store.get(key);
  if (!entry) {
    entry = { count: 1, resetAt: now + WINDOW_MS };
    store.set(key, entry);
    return { ok: true, remaining: MAX_PER_WINDOW - 1 };
  }
  if (now >= entry.resetAt) {
    entry = { count: 1, resetAt: now + WINDOW_MS };
    store.set(key, entry);
    return { ok: true, remaining: MAX_PER_WINDOW - 1 };
  }
  entry.count += 1;
  const remaining = Math.max(0, MAX_PER_WINDOW - entry.count);
  return { ok: entry.count <= MAX_PER_WINDOW, remaining };
}
