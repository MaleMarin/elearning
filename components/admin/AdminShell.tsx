"use client";

import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

export interface AdminShellProps {
  children: React.ReactNode;
}

/**
 * Layout del panel de administrador: sidebar azul #1428d4 (220px) + área principal
 * con topbar (migas de pan + usuario + badge Admin). Mismo design system que el alumno
 * en el contenido (fondo #f0f2f5, neumorfismo).
 */
export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="flex min-h-screen" style={{ background: "var(--neu-bg)" }}>
      <AdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <AdminTopbar />
        <main
          id="main-content"
          className="flex-1 overflow-auto px-4 py-6 sm:px-6"
          style={{ background: "var(--neu-bg)" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
