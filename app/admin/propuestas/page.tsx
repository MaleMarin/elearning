"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Propuesta {
  id: string;
  titulo: string;
  descripcion: string;
  autorNombre: string;
  autorInstitucion: string;
  moduleIdSugerido: string;
  estado: string;
  feedbackAdmin?: string;
  createdAt?: string;
}

export default function PropuestasPage() {
  const [propuestas, setPropuestas] = useState<Propuesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [rechazandoId, setRechazandoId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    fetch("/api/admin/propuestas", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setPropuestas(d.propuestas || []))
      .catch(() => setPropuestas([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAprobar = async (id: string) => {
    const res = await fetch(`/api/admin/propuestas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "aprobar" }),
    });
    if (res.ok) setPropuestas((p) => p.map((x) => (x.id === id ? { ...x, estado: "aprobada" } : x)));
  };

  const handleRechazar = async (id: string) => {
    const res = await fetch(`/api/admin/propuestas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "rechazar", feedbackAdmin: feedback }),
    });
    if (res.ok) {
      setPropuestas((p) => p.map((x) => (x.id === id ? { ...x, estado: "rechazada" } : x)));
      setRechazandoId(null);
      setFeedback("");
    }
  };

  const pendientes = propuestas.filter((p) => p.estado === "enviada" || p.estado === "en_revision" || p.estado === "borrador");
  const resueltas = propuestas.filter((p) => p.estado === "aprobada" || p.estado === "rechazada");

  return (
    <div style={{ flex: 1, padding: "18px 16px", background: "#e8eaf0", minHeight: "100vh", fontFamily: "var(--font-heading)" }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/admin" style={{ fontSize: 13, color: "#8892b0", marginBottom: 8, display: "inline-block" }}>← Admin</Link>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", letterSpacing: "-0.5px" }}>Propuestas UGC</h1>
        <p style={{ fontSize: 13, color: "#8892b0", marginTop: 4 }}>Lecciones enviadas por alumnos. Aprobar crea borrador en el módulo sugerido.</p>
      </div>

      {loading ? (
        <p style={{ color: "#8892b0", fontSize: 13 }}>Cargando…</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, background: "#e8eaf0", borderRadius: 14, boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "12px 16px", color: "#8892b0", fontWeight: 600 }}>Título</th>
                <th style={{ textAlign: "left", padding: "12px 16px", color: "#8892b0", fontWeight: 600 }}>Autor</th>
                <th style={{ textAlign: "left", padding: "12px 16px", color: "#8892b0", fontWeight: 600 }}>Institución</th>
                <th style={{ textAlign: "left", padding: "12px 16px", color: "#8892b0", fontWeight: 600 }}>Módulo sugerido</th>
                <th style={{ textAlign: "left", padding: "12px 16px", color: "#8892b0", fontWeight: 600 }}>Estado</th>
                <th style={{ textAlign: "right", padding: "12px 16px", color: "#8892b0", fontWeight: 600 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {[...pendientes, ...resueltas].map((p) => (
                <tr key={p.id} style={{ borderTop: "1px solid rgba(194,200,214,0.5)" }}>
                  <td style={{ padding: "12px 16px", color: "#0a0f8a", fontWeight: 500 }}>{p.titulo}</td>
                  <td style={{ padding: "12px 16px", color: "#4a5580" }}>{p.autorNombre}</td>
                  <td style={{ padding: "12px 16px", color: "#8892b0" }}>{p.autorInstitucion || "—"}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#4a5580" }}>{p.moduleIdSugerido || "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: 20,
                        background: p.estado === "aprobada" ? "rgba(0,184,125,0.15)" : p.estado === "rechazada" ? "rgba(216,64,64,0.15)" : "rgba(20,40,212,0.1)",
                        color: p.estado === "aprobada" ? "#00b87d" : p.estado === "rechazada" ? "#d84040" : "#1428d4",
                      }}
                    >
                      {p.estado}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    {(p.estado === "enviada" || p.estado === "en_revision") && (
                      <>
                        {rechazandoId === p.id ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                            <input
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              placeholder="Feedback (opcional)"
                              style={{
                                width: "100%",
                                padding: "8px 12px",
                                borderRadius: 10,
                                border: "none",
                                background: "#e8eaf0",
                                boxShadow: "inset 2px 2px 5px #c2c8d6",
                                fontSize: 12,
                                color: "#0a0f8a",
                              }}
                            />
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                type="button"
                                onClick={() => { setRechazandoId(null); setFeedback(""); }}
                                style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, background: "#e8eaf0", color: "#4a5580", boxShadow: "2px 2px 5px #c2c8d6" }}
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRechazar(p.id)}
                                style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "#d84040", color: "white" }}
                              >
                                Rechazar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              onClick={() => handleAprobar(p.id)}
                              style={{ padding: "6px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "var(--font-heading)", fontSize: 11, fontWeight: 700, background: "linear-gradient(135deg, #00b87d, #00a06c)", color: "white" }}
                            >
                              Aprobar
                            </button>
                            <button
                              type="button"
                              onClick={() => setRechazandoId(p.id)}
                              style={{ padding: "6px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "var(--font-heading)", fontSize: 11, fontWeight: 600, background: "#e8eaf0", color: "#d84040", boxShadow: "2px 2px 5px #c2c8d6" }}
                            >
                              Rechazar
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && propuestas.length === 0 && (
        <div style={{ background: "#e8eaf0", borderRadius: 18, padding: 40, textAlign: "center", boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff" }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#0a0f8a" }}>Sin propuestas</p>
          <p style={{ fontSize: 13, color: "#8892b0", marginTop: 6 }}>No hay propuestas de lección enviadas por alumnos.</p>
        </div>
      )}
    </div>
  );
}
