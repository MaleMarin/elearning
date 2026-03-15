"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageSection } from "@/components/ui";
import { CertificateManager } from "@/components/admin/CertificateManager";
import { ChevronLeft } from "lucide-react";

export default function AdminCertificadosPage() {
  const [cohorts, setCohorts] = useState<{ id: string; name: string }[]>([]);
  const [cohortId, setCohortId] = useState("");

  useEffect(() => {
    fetch("/api/admin/cohorts", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d) ? d : [];
        setCohorts(list.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
        if (list[0]) setCohortId(list[0].id);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/admin" className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--ink)] mb-6">
        <ChevronLeft className="w-5 h-5" /> Admin
      </Link>
      <PageSection
        title="Certificados"
        subtitle="Emitir certificados manualmente o en lote. Solo administradores."
      >
        <></>
      </PageSection>
      <CertificateManager
        cohortId={cohortId}
        cohorts={cohorts}
        onCohortChange={setCohortId}
      />
    </div>
  );
}
