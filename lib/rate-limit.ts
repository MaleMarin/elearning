/**
 * Rate limit in-memory por identificador (ej. user_id o IP).
 * En producción con múltiples instancias usar Redis (Upstash) o Vercel KV.
 */

const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_PER_WINDOW = 30;   // máx solicitudes por ventana (API general)

/** Login: más estricto para evitar fuerza bruta */
const LOGIN_WINDOW_MS = 60 * 1000;
const LOGIN_MAX_PER_WINDOW = 5;

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

const loginStore = new Map<string, { count: number; resetAt: number }>();

/** Admin IA: máx 10 llamadas por admin por día (control de costos). */
const ADMIN_AI_WINDOW_MS = 24 * 60 * 60 * 1000;
const ADMIN_AI_MAX_PER_DAY = 10;
const adminAIStore = new Map<string, { count: number; resetAt: number }>();

export function checkAdminAIRateLimit(adminUid: string): { ok: boolean; remaining: number } {
  const now = Date.now();
  let entry = adminAIStore.get(adminUid);
  if (!entry) {
    entry = { count: 1, resetAt: now + ADMIN_AI_WINDOW_MS };
    adminAIStore.set(adminUid, entry);
    return { ok: true, remaining: ADMIN_AI_MAX_PER_DAY - 1 };
  }
  if (now >= entry.resetAt) {
    entry = { count: 1, resetAt: now + ADMIN_AI_WINDOW_MS };
    adminAIStore.set(adminUid, entry);
    return { ok: true, remaining: ADMIN_AI_MAX_PER_DAY - 1 };
  }
  entry.count += 1;
  const remaining = Math.max(0, ADMIN_AI_MAX_PER_DAY - entry.count);
  return { ok: entry.count <= ADMIN_AI_MAX_PER_DAY, remaining };
}

export function checkLoginRateLimit(ipKey: string): { ok: boolean; remaining: number } {
  const now = Date.now();
  let entry = loginStore.get(ipKey);
  if (!entry) {
    entry = { count: 1, resetAt: now + LOGIN_WINDOW_MS };
    loginStore.set(ipKey, entry);
    return { ok: true, remaining: LOGIN_MAX_PER_WINDOW - 1 };
  }
  if (now >= entry.resetAt) {
    entry = { count: 1, resetAt: now + LOGIN_WINDOW_MS };
    loginStore.set(ipKey, entry);
    return { ok: true, remaining: LOGIN_MAX_PER_WINDOW - 1 };
  }
  entry.count += 1;
  const remaining = Math.max(0, LOGIN_MAX_PER_WINDOW - entry.count);
  return { ok: entry.count <= LOGIN_MAX_PER_WINDOW, remaining };
}
