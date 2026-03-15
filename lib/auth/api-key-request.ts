/**
 * Obtiene y valida API key desde la petición (header X-API-Key).
 * Para usar en rutas /api/v1 que requieran API key.
 */

import { NextRequest } from "next/server";
import { validateApiKey, hasPermiso, type ApiKeyRecord, type ApiKeyPermiso } from "@/lib/services/apiKeys";

export async function getApiKeyFromRequest(req: NextRequest): Promise<{
  valid: true;
  record: ApiKeyRecord;
} | { valid: false; error: string }> {
  const rawKey = req.headers.get("x-api-key") ?? req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
  if (!rawKey?.trim()) {
    return { valid: false, error: "Falta X-API-Key o Authorization" };
  }
  const result = await validateApiKey(rawKey);
  if (!result) {
    return { valid: false, error: "API key inválida o revocada" };
  }
  return { valid: true, record: result.record };
}

export async function requireApiKey(
  req: NextRequest,
  permiso: ApiKeyPermiso
): Promise<{ record: ApiKeyRecord } | { error: string; status: number }> {
  const auth = await getApiKeyFromRequest(req);
  if (!auth.valid) {
    return { error: auth.error, status: 401 };
  }
  if (!hasPermiso(auth.record, permiso)) {
    return { error: "Permiso insuficiente para esta operación", status: 403 };
  }
  return { record: auth.record };
}
