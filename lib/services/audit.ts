import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface AuditPayload {
  user_id: string;
  role: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  payload?: Record<string, unknown>;
  ip?: string;
}

/**
 * Registra una acción de admin/mentor en audit_logs.
 * Llamar desde API routes después de verificar rol.
 */
export async function auditLog(params: {
  userId: string;
  role: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  payload?: Record<string, unknown>;
  ip?: string;
}): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.from("audit_logs").insert({
      user_id: params.userId,
      role: params.role,
      action: params.action,
      resource_type: params.resourceType ?? null,
      resource_id: params.resourceId ?? null,
      payload: params.payload ?? {},
      ip: params.ip ?? null,
    });
  } catch (e) {
    console.error("audit_log failed:", e);
  }
}

/** Obtiene IP del request (Vercel/proxy). */
export function getClientIp(req: { headers: { get: (name: string) => string | null } }): string | undefined {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    undefined
  );
}
