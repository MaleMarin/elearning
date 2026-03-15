/**
 * Obtiene el tenant en el servidor (layout, API) a partir de headers.
 * No lanza: devuelve null si no hay tenant o si Firestore no está disponible.
 */

import { headers } from "next/headers";
import { getTenant } from "@/lib/services/tenant";
import type { TenantInfo } from "@/contexts/TenantContext";

export async function getTenantFromRequest(): Promise<TenantInfo | null> {
  try {
    const headersList = await headers();
    const tenantId = headersList.get("x-tenant-id");
    if (!tenantId?.trim()) return null;
    const tenant = await getTenant(tenantId);
    if (!tenant) return null;
    return {
      tenantId: tenant.tenantId,
      nombre: tenant.nombre,
      subdominio: tenant.subdominio,
      logo: tenant.logo,
      colorPrimario: tenant.colorPrimario,
      colorSecundario: tenant.colorSecundario,
      fraseBienvenida: tenant.fraseBienvenida,
      plan: tenant.plan,
    };
  } catch {
    return null;
  }
}
