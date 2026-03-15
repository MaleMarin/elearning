"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { SurfaceCard } from "@/components/ui";

interface CertData {
  valid: true;
  nombre: string;
  curso: string;
  fecha: string;
  calificacion: string;
  idCert: string;
}

export default function VerificarCertificadoPage() {
  const params = useParams();
  const idCert = typeof params.idCert === "string" ? params.idCert : "";
  const [data, setData] = useState<CertData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idCert) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    fetch(`/api/certificado/verificar?idCert=${encodeURIComponent(idCert)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.valid && d.nombre) {
          setData({
            valid: true,
            nombre: d.nombre,
            curso: d.curso,
            fecha: d.fecha,
            calificacion: d.calificacion,
            idCert: d.idCert,
          });
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [idCert]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)]">
        <SurfaceCard padding="lg" clickable={false}>
          <p className="text-[var(--ink-muted)]">Verificando certificado…</p>
        </SurfaceCard>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)]">
        <SurfaceCard padding="lg" clickable={false}>
          <p className="text-2xl mb-2" aria-hidden>❌</p>
          <h1 className="text-xl font-semibold text-[var(--ink)]">Certificado no encontrado</h1>
          <p className="text-[var(--ink-muted)] mt-2">
            El ID de verificación no corresponde a un certificado emitido por Política Digital.
          </p>
        </SurfaceCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)]">
      <SurfaceCard padding="lg" clickable={false} className="max-w-md w-full">
        <p className="text-2xl mb-2" aria-hidden>✅</p>
        <h1 className="text-xl font-semibold text-[var(--ink)]">Certificado válido</h1>
        <dl className="mt-4 space-y-2 text-sm">
          <div>
            <dt className="text-[var(--ink-muted)]">Nombre</dt>
            <dd className="font-medium text-[var(--ink)]">{data.nombre}</dd>
          </div>
          <div>
            <dt className="text-[var(--ink-muted)]">Programa</dt>
            <dd className="font-medium text-[var(--ink)]">{data.curso}</dd>
          </div>
          <div>
            <dt className="text-[var(--ink-muted)]">Fecha de emisión</dt>
            <dd className="font-medium text-[var(--ink)]">{data.fecha}</dd>
          </div>
          <div>
            <dt className="text-[var(--ink-muted)]">Calificación</dt>
            <dd className="font-medium text-[var(--ink)]">{data.calificacion}</dd>
          </div>
          <div>
            <dt className="text-[var(--ink-muted)]">ID de verificación</dt>
            <dd className="font-mono text-[var(--ink)]">{data.idCert}</dd>
          </div>
        </dl>
        <p className="text-xs text-[var(--ink-muted)] mt-6">
          Política Digital · Innovación Pública · México
        </p>
      </SurfaceCard>
    </div>
  );
}
