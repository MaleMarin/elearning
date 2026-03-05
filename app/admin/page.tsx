"use client";

import Link from "next/link";
import { SurfaceCard, PageSection, PrimaryButton } from "@/components/ui";
import { BookOpen, Users } from "lucide-react";

/**
 * Dashboard de admin: acceso rápido a Cursos y Cohortes.
 * No es una tabla documental; solo enlaces de producto.
 */
export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-[#F3F2EF]">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6">
        <PageSection
          title="Admin"
          subtitle="Gestiona contenidos y cohortes desde aquí."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <SurfaceCard padding="lg" clickable={false} className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold text-[var(--ink)]">Cursos (contenido)</h2>
              </div>
              <p className="text-sm text-[var(--ink-muted)]">
                Crea y edita cursos, módulos y lecciones. Asigna cursos a cohortes.
              </p>
              <PrimaryButton href="/admin/cursos" className="w-fit">
                Ir a cursos
              </PrimaryButton>
            </SurfaceCard>
            <SurfaceCard padding="lg" clickable={false} className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold text-[var(--ink)]">Cohortes e invitaciones</h2>
              </div>
              <p className="text-sm text-[var(--ink-muted)]">
                Crea cohortes y genera códigos para inscribir estudiantes.
              </p>
              <PrimaryButton href="/admin/cohortes" className="w-fit">
                Ir a cohortes
              </PrimaryButton>
            </SurfaceCard>
          </div>
        </PageSection>
      </div>
    </div>
  );
}
