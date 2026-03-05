"use client";

import { Sidebar } from "./Sidebar";
import { RightRail } from "./RightRail";
import { AssistantFab } from "@/components/assistant/AssistantFab";

export interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Layout principal de la plataforma: sidebar izquierda, contenido central, panel derecho.
 * Incluye el FAB del asistente fijo abajo a la derecha.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main
        className="flex-1 min-w-0 px-6 py-8 lg:px-8 lg:py-10 relative z-10"
        role="main"
        id="main-content"
      >
        {children}
      </main>
      <RightRail />
      <AssistantFab />
    </div>
  );
}
