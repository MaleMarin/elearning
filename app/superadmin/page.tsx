"use client";

import { useState, useEffect } from "react";
import { SurfaceCard } from "@/components/ui";
import { Users, BookOpen, Award, Building2 } from "lucide-react";

type Metrics = {
  totalAlumnos: number;
  totalCursos: number;
  totalCertificados: number;
  totalTenants: number;
};

export default function SuperadminDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/superadmin/metrics", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setMetrics(data);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setMetrics((m) => m ?? { totalAlumnos: 0, totalCursos: 0, totalCertificados: 0, totalTenants: 0 }));
  }, []);

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-[var(--ink)] mb-4">Dashboard</h1>
        <p className="text-[var(--coral)]">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--ink)] mb-2">Métricas globales</h1>
      <p className="text-[var(--ink-muted)] mb-6">Resumen de la plataforma multi-tenant.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SurfaceCard padding="lg" clickable={false}>
          <div className="flex items-center gap-3">
            <Users className="w-10 h-10 text-[var(--primary)]" />
            <div>
              <p className="text-2xl font-bold text-[var(--ink)]">{metrics?.totalAlumnos ?? "—"}</p>
              <p className="text-sm text-[var(--ink-muted)]">Total alumnos</p>
            </div>
          </div>
        </SurfaceCard>
        <SurfaceCard padding="lg" clickable={false}>
          <div className="flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-[var(--primary)]" />
            <div>
              <p className="text-2xl font-bold text-[var(--ink)]">{metrics?.totalCursos ?? "—"}</p>
              <p className="text-sm text-[var(--ink-muted)]">Cursos</p>
            </div>
          </div>
        </SurfaceCard>
        <SurfaceCard padding="lg" clickable={false}>
          <div className="flex items-center gap-3">
            <Award className="w-10 h-10 text-[var(--primary)]" />
            <div>
              <p className="text-2xl font-bold text-[var(--ink)]">{metrics?.totalCertificados ?? "—"}</p>
              <p className="text-sm text-[var(--ink-muted)]">Certificados</p>
            </div>
          </div>
        </SurfaceCard>
        <SurfaceCard padding="lg" clickable={false}>
          <div className="flex items-center gap-3">
            <Building2 className="w-10 h-10 text-[var(--primary)]" />
            <div>
              <p className="text-2xl font-bold text-[var(--ink)]">{metrics?.totalTenants ?? "—"}</p>
              <p className="text-sm text-[var(--ink-muted)]">Tenants</p>
            </div>
          </div>
        </SurfaceCard>
      </div>

      <p className="mt-6 text-sm text-[var(--ink-muted)]">
        Configura <code className="bg-[var(--surface-soft)] px-1 rounded">SUPERADMIN_EMAIL</code> o{" "}
        <code className="bg-[var(--surface-soft)] px-1 rounded">SUPERADMIN_UIDS</code> en el servidor para restringir el acceso a esta zona.
      </p>
    </div>
  );
}
