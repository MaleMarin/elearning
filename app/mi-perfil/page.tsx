"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PerfilContent } from "@/components/profile/PerfilContent";

/** Perfil del alumno dentro del dashboard (misma barra neumórfica que /inicio). */
export default function MiPerfilPage() {
  return (
    <DashboardShell subtitle="// Mi perfil">
      <PerfilContent />
    </DashboardShell>
  );
}
