/**
 * Variables de entorno con validación y valores por defecto seguros.
 * NEXT_PUBLIC_DEMO_MODE=true → plataforma sin Supabase (placeholders).
 * NEXT_PUBLIC_DEMO_MODE=false → exige envs críticas o falla con mensaje claro.
 */

const env = (key: string): string | undefined =>
  typeof process !== "undefined" ? process.env[key] : undefined;

/** Modo demo: true = ver plataforma sin backend real (login saltado, datos placeholder). */
export function getDemoMode(): boolean {
  const v = env("NEXT_PUBLIC_DEMO_MODE");
  if (v === "true" || v === "1") return true;
  if (v === "false" || v === "0") return false;
  const hasFirebase =
    (env("NEXT_PUBLIC_FIREBASE_API_KEY") ?? "").trim() !== "" &&
    (env("NEXT_PUBLIC_FIREBASE_PROJECT_ID") ?? "").trim() !== "";
  if (!hasFirebase && env("NODE_ENV") === "development") return true;
  return !hasFirebase;
}

/** Backend real cuando DEMO_MODE=false: Firebase. */
export function useFirebase(): boolean {
  return !getDemoMode();
}

const CRITICAL_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
] as const;

/**
 * Valida que las envs críticas estén definidas.
 * Si DEMO_MODE=true no lanza (las keys pueden faltar).
 * En desarrollo, si faltan las keys no se lanza para no bloquear (se asume demo).
 * Solo en producción con DEMO_MODE=false se exigen las variables.
 */
export function validateEnv(): void {
  if (getDemoMode()) return;
  const missing = CRITICAL_KEYS.filter((key) => {
    const v = env(key);
    return v === undefined || v === "";
  });
  if (missing.length === 0) return;
  if (env("NODE_ENV") === "development") return;
  throw new Error(
    `Faltan variables de entorno requeridas (modo real Firebase): ${missing.join(", ")}. ` +
      "Copia .env.example a .env.local y complétalas, o usa NEXT_PUBLIC_DEMO_MODE=true para modo demo."
  );
}

/** UIDs o email del superadmin (solo esa cuenta puede acceder a /superadmin). Ej: SUPERADMIN_UIDS=uid1,uid2 o SUPERADMIN_EMAIL=tu@email.com */
export function getSuperadminUids(): string[] {
  const v = env("SUPERADMIN_UIDS");
  if (v?.trim()) return v.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

export function getSuperadminEmail(): string | null {
  const v = env("SUPERADMIN_EMAIL");
  return v?.trim() || null;
}

/** URL de la app (solo lectura). Default seguro. */
export function getAppUrl(): string {
  const u = env("APP_URL") ?? env("NEXT_PUBLIC_SITE_URL");
  if (u && u !== "") return u.replace(/\/$/, "");
  if (env("VERCEL_URL")) return `https://${env("VERCEL_URL")}`;
  return "http://localhost:3000";
}
