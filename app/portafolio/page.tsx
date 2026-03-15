"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PortafolioShell } from "@/components/portafolio/PortafolioShell";
import { PortafolioTimeline } from "@/components/portafolio/PortafolioTimeline";
import { NuevaEntrada } from "@/components/portafolio/NuevaEntrada";
import type { Entrada } from "@/components/portafolio/EntradaModulo";

const NM = {
  bg: "#e8eaf0",
  elevated: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
};

function IcoBookOpen() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

export default function PortafolioPage() {
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [modal, setModal] = useState<{ moduloId: string; moduloTitulo: string } | null>(null);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/portafolio/export-pdf", { credentials: "include" });
      if (!res.ok) throw new Error("Error al generar PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "portafolio-transformacion.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetch("/api/portafolio/entradas", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { entradas: [] }))
      .then((data) => {
        setEntradas(data.entradas || []);
      })
      .catch(() => setEntradas([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (entrada: Entrada) => {
    setEntradas((prev) => {
      const rest = prev.filter((e) => e.moduloId !== entrada.moduloId);
      return [{ ...entrada, updatedAt: entrada.updatedAt || new Date().toISOString() }, ...rest];
    });
  };

  const isEmpty = !loading && entradas.length === 0;

  return (
    <PortafolioShell>
      <div style={{ maxWidth: 720, margin: "0 auto", fontFamily: "'Syne', sans-serif" }}>
        <header style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", marginBottom: 4, letterSpacing: "-0.3px" }}>
              Mi portafolio de transformación
            </h1>
            <p style={{ fontSize: 12, color: "#8892b0", fontFamily: "'Space Mono', monospace" }}>
              // Tu historia de aprendizaje · Grupo 2026-A
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={exporting}
            style={{
              padding: "10px 18px",
              borderRadius: 12,
              border: "none",
              cursor: exporting ? "not-allowed" : "pointer",
              fontFamily: "'Syne', sans-serif",
              fontSize: 12,
              fontWeight: 700,
              background: exporting
                ? NM.bg
                : "linear-gradient(135deg, #1428d4, #0a0f8a)",
              color: exporting ? "#8892b0" : "white",
              boxShadow: exporting
                ? "inset 3px 3px 7px #c2c8d6, inset -3px -3px 7px #ffffff"
                : "5px 5px 12px rgba(10,15,138,0.35), -3px -3px 8px rgba(255,255,255,0.7)",
              display: "flex",
              alignItems: "center",
              gap: 7,
              transition: "all 0.2s ease",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {exporting ? "Generando PDF…" : "Exportar mi portafolio"}
          </button>
        </header>

        {loading && (
          <p style={{ fontSize: 13, color: "#8892b0" }}>Cargando…</p>
        )}

        {!loading && isEmpty && (
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              background: NM.bg,
              borderRadius: 20,
              boxShadow: NM.elevated,
            }}
          >
            <div style={{ color: "#8892b0", marginBottom: 16, display: "flex", justifyContent: "center" }}>
              <IcoBookOpen />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0a0f8a", marginBottom: 8 }}>
              Tu historia comienza aquí
            </h2>
            <p style={{ fontSize: 13, color: "#4a5580", marginBottom: 24, maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}>
              Completa un módulo para agregar tu primera entrada
            </p>
            <Link
              href="/curso"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                borderRadius: 14,
                border: "none",
                cursor: "pointer",
                fontFamily: "'Syne', sans-serif",
                fontSize: 13,
                fontWeight: 700,
                background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
                color: "white",
                boxShadow: "5px 5px 12px rgba(10,15,138,0.35), -3px -3px 8px rgba(255,255,255,0.7)",
                textDecoration: "none",
              }}
            >
              Ir al curso
            </Link>
          </div>
        )}

        {!loading && !isEmpty && (
          <PortafolioTimeline
            entradas={entradas}
            onNuevaEntrada={(moduloId, moduloTitulo) => setModal({ moduloId, moduloTitulo })}
          />
        )}

        {modal && (
          <NuevaEntrada
            moduloId={modal.moduloId}
            moduloTitulo={modal.moduloTitulo}
            onSave={handleSave}
            onClose={() => setModal(null)}
          />
        )}
      </div>
    </PortafolioShell>
  );
}
