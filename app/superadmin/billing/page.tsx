"use client";

import Link from "next/link";
import { SurfaceCard } from "@/components/ui";
import { ChevronLeft, CreditCard } from "lucide-react";

export default function SuperadminBillingPage() {
  return (
    <div>
      <Link href="/superadmin" className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] no-underline text-sm font-medium mb-4">
        <ChevronLeft className="w-4 h-4" /> Volver
      </Link>
      <h1 className="text-2xl font-bold text-[var(--ink)] mb-2 flex items-center gap-2">
        <CreditCard className="w-7 h-7 text-[var(--primary)]" /> Facturación por tenant
      </h1>
      <p className="text-[var(--ink-muted)] mb-6">
        Vista de uso y facturación por institución. Integrar con el proveedor de facturación (Stripe, etc.) según plan.
      </p>
      <SurfaceCard padding="lg" clickable={false}>
        <p className="text-[var(--ink-muted)] text-center py-12">
          Próximamente: métricas de uso por tenant (alumnos activos, almacenamiento, certificados emitidos) y exportación para facturación.
        </p>
      </SurfaceCard>
    </div>
  );
}
