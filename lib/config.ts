/**
 * Configuración por entorno. Nunca hardcodear URLs ni keys.
 * Todas las variables se leen de process.env.
 * Con NEXT_PUBLIC_DEMO_MODE=true no se exigen keys de Supabase.
 */

import { getDemoMode, validateEnv } from "@/lib/env";

export type NodeEnv = "development" | "test" | "production";

function env(key: string): string | undefined {
  return process.env[key];
}

function required(key: string, forEnv?: NodeEnv): string {
  const v = env(key);
  const nodeEnv = (env("NODE_ENV") ?? "development") as NodeEnv;
  if (!v || v === "") {
    if (forEnv && nodeEnv === forEnv) throw new Error(`Missing required env: ${key}`);
    return undefined as unknown as string;
  }
  return v;
}

/** Entorno actual */
export function getNodeEnv(): NodeEnv {
  return (env("NODE_ENV") ?? env("VERCEL_ENV") ?? "development") as NodeEnv;
}

export const isProd = () => getNodeEnv() === "production";
export const isStaging = () => env("VERCEL_ENV") === "preview" || env("STAGING") === "1";

/** URL pública del sitio (redirects, links). Preferir APP_URL. */
export function getSiteUrl(): string {
  const u = env("APP_URL") ?? env("NEXT_PUBLIC_SITE_URL");
  if (u && u !== "") return u.replace(/\/$/, "");
  if (env("VERCEL_URL")) return `https://${env("VERCEL_URL")}`;
  return "http://localhost:3000";
}

/** Supabase: obligatorios en modo real; en demo devuelve valores placeholder para no romper build. */
export function getSupabaseConfig() {
  if (getDemoMode()) {
    return {
      url: env("NEXT_PUBLIC_SUPABASE_URL") || "https://demo.supabase.co",
      anonKey: env("NEXT_PUBLIC_SUPABASE_ANON_KEY") || "demo-anon-key",
    };
  }
  validateEnv();
  const url = env("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!url || !anonKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return { url, anonKey };
}

/** Service role: solo servidor; no exponer al cliente. */
export function getSupabaseServiceRoleKey(): string | undefined {
  return env("SUPABASE_SERVICE_ROLE_KEY");
}

/** WhatsApp (opcional). */
export function getWhatsAppConfig() {
  return {
    accessToken: env("WHATSAPP_ACCESS_TOKEN"),
    phoneNumberId: env("WHATSAPP_PHONE_NUMBER_ID"),
    verifyToken: env("WHATSAPP_VERIFY_TOKEN"),
  };
}

/** Cron / jobs: secret para proteger /api/jobs/run. */
export function getCronSecret(): string | undefined {
  return env("CRON_SECRET");
}

/** Modelo IA (opcional; sin key = mock). */
export function getModelConfig() {
  return {
    apiKey: env("MODEL_API_KEY"),
    baseUrl: env("MODEL_API_BASE_URL"),
    model: env("MODEL_NAME") ?? "gpt-4o-mini",
  };
}

/** Seed: "staging" = habilitar endpoint y seed demo; "none" = deshabilitar. */
export function getSeedMode(): "staging" | "none" {
  const v = (env("SEED_MODE") ?? "none").toLowerCase();
  return v === "staging" ? "staging" : "none";
}

/** Secret para autorizar POST /api/seed (solo cuando SEED_MODE=staging). */
export function getSeedSecret(): string | undefined {
  return env("SEED_SECRET");
}
