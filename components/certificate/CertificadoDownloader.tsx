"use client";

import { SurfaceCard, PrimaryButton } from "@/components/ui";

export interface CertificadoDownloaderProps {
  idCert: string;
  nombre: string;
  curso: string;
  fecha: string;
  calificacion: string;
  storageUrl: string | null;
  verifyUrl: string;
  certificatePercent?: number | null;
}

export function CertificadoDownloader({
  idCert,
  nombre,
  curso,
  fecha,
  calificacion,
  storageUrl,
  verifyUrl,
}: CertificadoDownloaderProps) {
  const year = new Date(fecha).getFullYear();
  const month = new Date(fecha).getMonth() + 1;
  const linkedInShare = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(curso)}&organizationName=Política+Digital&issueYear=${year}&issueMonth=${month}&certUrl=${encodeURIComponent(verifyUrl)}`;

  return (
    <SurfaceCard padding="lg" clickable={false}>
      <h2 className="text-xl font-semibold text-[var(--ink)]">Tu certificado</h2>
      <p className="text-[var(--ink-muted)] mt-1">
        {curso} — Emitido el {fecha}. Calificación: {calificacion}
      </p>
      <p className="text-sm text-[var(--ink-muted)] mt-2 font-mono">ID de verificación: {idCert}</p>
      <div className="flex flex-wrap gap-3 mt-6">
        {storageUrl && (
          <PrimaryButton href={storageUrl} className="inline-flex">
            Descargar PDF
          </PrimaryButton>
        )}
        <a
          href={verifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 font-medium rounded-full min-h-[48px] px-6 border-2 border-[var(--line)] text-[var(--ink)] hover:border-[var(--primary)]"
        >
          Ver certificado
        </a>
        <a
          href={linkedInShare}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 font-medium rounded-full min-h-[48px] px-6 bg-[#0A66C2] text-white"
        >
          Compartir en LinkedIn
        </a>
      </div>
    </SurfaceCard>
  );
}
