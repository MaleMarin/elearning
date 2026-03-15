/**
 * Hook useTenant — lee el tenant actual (subdominio) para personalizar la UI.
 * Retorna { tenantId, nombre, logo, colores } o null si es el dominio principal.
 */
export { useTenant } from "@/contexts/TenantContext";
export type { TenantInfo } from "@/contexts/TenantContext";
