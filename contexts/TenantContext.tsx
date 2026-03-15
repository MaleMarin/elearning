"use client";

import { createContext, useContext } from "react";

/** Datos de tenant que el cliente necesita para personalizar la UI (serializable desde server). */
export interface TenantInfo {
  tenantId: string;
  nombre: string;
  subdominio: string;
  logo: string;
  colorPrimario: string;
  colorSecundario: string;
  fraseBienvenida: string;
  plan: string;
}

const defaultTenant: TenantInfo | null = null;
const TenantContext = createContext<TenantInfo | null>(defaultTenant);

export function TenantProvider({
  children,
  initialTenant,
}: {
  children: React.ReactNode;
  initialTenant: TenantInfo | null;
}) {
  return (
    <TenantContext.Provider value={initialTenant ?? null}>
      {children}
    </TenantContext.Provider>
  );
}

/** Hook para leer el tenant actual (subdominio). Retorna null si es el dominio principal. */
export function useTenant(): TenantInfo | null {
  return useContext(TenantContext);
}
