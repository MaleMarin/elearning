"use client";

import { useState, useEffect } from "react";
import { EmptyState } from "@/components/ui/EmptyState";

interface Certificate {
  id: string;
  user_id: string;
  cohort_id: string | null;
  course_id: string | null;
  issued_at: string;
}

export default function CertificadoPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/certificates")
      .then((r) => r.json())
      .then((d) => setCertificates(d.certificates ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-[var(--text)] mb-4">Certificado</h1>
        <div className="card-white p-6 animate-pulse">
          <div className="h-5 bg-gray-100 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-[var(--text)] mb-6">Certificado</h1>
        <EmptyState
          title="Tu certificado aparecerá cuando completes el programa"
          description="Al finalizar el curso y cumplir los requisitos, podrás descargar tu certificado desde aquí."
          ctaLabel="Ver curso"
          ctaHref="/curso"
          icon="🎓"
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-4">Certificado</h1>
      <p className="text-[var(--text-muted)] mb-6">
        Certificados emitidos.
      </p>
      <ul className="space-y-4">
        {certificates.map((c) => (
          <li key={c.id} className="card-white p-4">
            <p className="font-medium text-[var(--text)]">Certificado</p>
            <p className="text-base text-[var(--text-muted)]">
              Emitido: {new Date(c.issued_at).toLocaleDateString("es")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
