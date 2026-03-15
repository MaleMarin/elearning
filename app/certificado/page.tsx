"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EmptyState, ProgressBar, PrimaryButton } from "@/components/ui";
import { CertificadoDownloader } from "@/components/certificate/CertificadoDownloader";

interface Certificate {
  id: string;
  idCert: string;
  nombre: string;
  curso: string;
  fecha: string;
  calificacion: string;
  storageUrl: string | null;
  verifyUrl?: string;
}

export default function CertificadoPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [certificatePercent, setCertificatePercent] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/certificates", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/profile/progress", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([certRes, progressRes]) => {
        setCertificates(certRes.certificates ?? []);
        setCertificatePercent(progressRes.certificatePercent ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-[var(--ink)] mb-4">Certificado</h1>
        <div className="h-24 bg-[var(--surface-soft)] rounded-card animate-pulse" />
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-[var(--ink)] mb-6">Certificado</h1>
        {certificatePercent != null && (
          <div className="mb-6">
            <p className="text-sm text-[var(--ink-muted)] mb-2">{certificatePercent}% completado</p>
            <ProgressBar value={certificatePercent} max={100} aria-label="Progreso del curso" className="mb-4" />
          </div>
        )}
        <EmptyState
          title="Tu certificado aparecerá aquí"
          description={
            certificatePercent != null
              ? `Llevas el ${certificatePercent}% — completa el programa para obtenerlo.`
              : "Completa el programa para obtener tu certificado."
          }
          ctaLabel="Continuar aprendiendo"
          ctaHref="/curso"
          icon="🎓"
        />
        <p className="text-sm text-[var(--ink-muted)] mt-4 text-center">
          <Link href="/soporte?tema=certificado" className="text-[var(--primary)] hover:underline">
            Solicitar al administrador
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[var(--ink)] mb-4">Certificado</h1>
      <p className="text-[var(--ink-muted)] mb-6">
        Descarga tu certificado y compártelo. La verificación es pública para empleadores.
      </p>
      <ul className="space-y-6">
        {certificates.map((c) => (
          <li key={c.id}>
            <CertificadoDownloader
              idCert={c.idCert}
              nombre={c.nombre}
              curso={c.curso}
              fecha={c.fecha}
              calificacion={c.calificacion}
              storageUrl={c.storageUrl}
              verifyUrl={c.verifyUrl ?? `/verificar/${c.idCert}`}
              certificatePercent={certificatePercent}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
