/**
 * API Keys para integraciones institucionales.
 * Firestore: apiKeys/{keyHash} con keyHash = SHA-256 hex del valor de la key.
 * El valor plano de la key solo se devuelve una vez al crearla.
 */

import { createHash } from "crypto";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

const COLLECTION = "apiKeys";

export type ApiKeyPermiso = "progreso" | "admin" | "webhooks";

export interface ApiKeyRecord {
  keyHash: string;
  keyPrefix: string;
  institucion: string;
  permisos: ApiKeyPermiso[];
  createdAt: Date;
  lastUsedAt?: Date | null;
  revokedAt?: Date | null;
}

function db() {
  return getFirebaseAdminFirestore();
}

function hashKey(key: string): string {
  return createHash("sha256").update(key.trim()).digest("hex");
}

function keyPrefix(key: string): string {
  const k = key.trim();
  return k.length > 8 ? k.slice(0, 8) + "…" : "***";
}

/** Genera un valor de API key (pd_live_ + 32 chars aleatorios). */
export function generateKeyValue(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghjkmnpqrstuvwxyz";
  let s = "pd_live_";
  for (let i = 0; i < 32; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

/** Crea una API key. Devuelve el valor plano (mostrar una sola vez) y el registro. */
export async function createApiKey(
  institucion: string,
  permisos: ApiKeyPermiso[]
): Promise<{ keyValue: string; keyPrefix: string; id: string }> {
  const keyValue = generateKeyValue();
  const keyHash = hashKey(keyValue);
  const prefix = keyPrefix(keyValue);
  const ref = db().collection(COLLECTION).doc(keyHash);
  const now = new Date();
  await ref.set({
    keyHash,
    keyPrefix: prefix,
    institucion: institucion.trim(),
    permisos: Array.from(new Set(permisos)),
    createdAt: now,
    lastUsedAt: null,
    revokedAt: null,
  });
  return { keyValue, keyPrefix: prefix, id: keyHash };
}

/** Valida la key y devuelve el registro si es válida. Actualiza lastUsedAt. */
export async function validateApiKey(
  rawKey: string | null
): Promise<{ record: ApiKeyRecord } | null> {
  if (!rawKey || typeof rawKey !== "string") return null;
  const keyHash = hashKey(rawKey);
  const ref = db().collection(COLLECTION).doc(keyHash);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const d = snap.data()!;
  if (d.revokedAt) return null;
  const toDate = (v: unknown): Date | null =>
    v == null ? null : typeof (v as { toDate?: () => Date }).toDate === "function" ? (v as { toDate: () => Date }).toDate() : new Date(v as string);
  const record: ApiKeyRecord = {
    keyHash: d.keyHash as string,
    keyPrefix: d.keyPrefix as string,
    institucion: d.institucion as string,
    permisos: (d.permisos as ApiKeyPermiso[]) ?? [],
    createdAt: toDate(d.createdAt) ?? new Date(),
    lastUsedAt: toDate(d.lastUsedAt),
    revokedAt: toDate(d.revokedAt),
  };
  await ref.update({ lastUsedAt: new Date() });
  return { record };
}

/** Verifica que la key tenga al menos uno de los permisos. */
export function hasPermiso(record: ApiKeyRecord, permiso: ApiKeyPermiso): boolean {
  return record.permisos.includes(permiso) || record.permisos.includes("admin");
}

/** Lista todas las keys (para admin). */
export async function listApiKeys(): Promise<(ApiKeyRecord & { id: string })[]> {
  const snap = await db().collection(COLLECTION).orderBy("createdAt", "desc").get();
  const toDate = (v: unknown): Date | null =>
    v == null ? null : typeof (v as { toDate?: () => Date }).toDate === "function" ? (v as { toDate: () => Date }).toDate() : new Date(v as string);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      keyHash: data.keyHash as string,
      keyPrefix: data.keyPrefix as string,
      institucion: data.institucion as string,
      permisos: (data.permisos as ApiKeyPermiso[]) ?? [],
      createdAt: toDate(data.createdAt) ?? new Date(),
      lastUsedAt: toDate(data.lastUsedAt),
      revokedAt: toDate(data.revokedAt),
    };
  });
}

/** Revoca una key por su id (hash). */
export async function revokeApiKey(keyHash: string): Promise<void> {
  const ref = db().collection(COLLECTION).doc(keyHash);
  await ref.update({ revokedAt: new Date() });
}
