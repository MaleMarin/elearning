"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";

/** Layout del portafolio: DashboardShell con subtítulo. */
export function PortafolioShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell subtitle="// Mi portafolio de transformación">
      {children}
    </DashboardShell>
  );
}
