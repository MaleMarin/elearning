"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CertificadoDownloader } from "@/components/certificate/CertificadoDownloader";

const REQUISITOS_DEMO = [
  { label: "Módulo 1 completado", done: true },
  { label: "Módulo 2 completado", done: false },
  { label: "Módulo 3 completado", done: false },
  { label: "Quiz final aprobado", done: false },
  { label: "Portafolio con 3 entradas", done: true },
];

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
      <div style={{ flex: 1, padding: "20px", background: "#e8eaf0", minHeight: "100vh", fontFamily: "'Syne', sans-serif" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", marginBottom: 4 }}>Certificado</h1>
        <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 24 }}>Cargando…</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, padding: "20px 20px", background: "#e8eaf0", minHeight: "100vh", fontFamily: "'Syne', sans-serif" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", marginBottom: 4 }}>Certificado</h1>
      <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 24 }}>
        {certificates.length > 0 ? "Descarga tu certificado y compártelo." : "Completa el programa para obtener tu certificado."}
      </p>

      {certificates.length === 0 ? (
        <>
          {certificatePercent != null && (
            <div style={{ background: "#e8eaf0", borderRadius: 20, padding: 24, marginBottom: 20, boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#8892b0", fontFamily: "'Space Mono', monospace", marginBottom: 10 }}>Progreso</p>
              <div style={{ height: 10, background: "#e8eaf0", borderRadius: 6, boxShadow: "inset 2px 2px 6px #c2c8d6", overflow: "hidden", marginBottom: 8 }}>
                <div style={{ height: "100%", width: `${certificatePercent}%`, background: "linear-gradient(90deg, #1428d4, #2b4fff)", borderRadius: 6 }} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#0a0f8a", fontFamily: "'Space Mono', monospace" }}>{certificatePercent}%</p>
            </div>
          )}
          <div style={{ background: "#e8eaf0", borderRadius: 20, padding: 24, marginBottom: 20, boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#8892b0", fontFamily: "'Space Mono', monospace", marginBottom: 14 }}>Requisitos</p>
            {REQUISITOS_DEMO.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: r.done ? "rgba(0,184,125,0.2)" : "#e8eaf0", boxShadow: r.done ? "none" : "inset 2px 2px 5px #c2c8d6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>{r.done ? "✓" : ""}</span>
                <span style={{ fontSize: 13, color: r.done ? "#00b87d" : "#4a5580" }}>{r.label}</span>
              </div>
            ))}
          </div>
          <Link href="/curso" style={{ display: "inline-block", padding: "12px 28px", borderRadius: 14, background: "linear-gradient(135deg, #1428d4, #0a0f8a)", color: "white", fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, textDecoration: "none", boxShadow: "5px 5px 12px rgba(10,15,138,0.35)" }}>Continuar aprendiendo</Link>
          <p style={{ marginTop: 16 }}>
            <Link href="/soporte?tema=certificado" style={{ fontSize: 13, color: "#1428d4", fontWeight: 600 }}>Solicitar al administrador</Link>
          </p>
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {certificates.map((c) => (
            <div key={c.id} style={{ background: "#e8eaf0", borderRadius: 20, padding: 24, boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff" }}>
              <CertificadoDownloader idCert={c.idCert} nombre={c.nombre} curso={c.curso} fecha={c.fecha} calificacion={c.calificacion} storageUrl={c.storageUrl} verifyUrl={c.verifyUrl ?? `/verificar/${c.idCert}`} certificatePercent={certificatePercent} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
