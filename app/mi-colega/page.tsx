"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FindColleague } from "@/components/community/FindColleague";
import { PairChat } from "@/components/community/PairChat";

interface Pair {
  id: string;
  userA: string;
  userB: string;
  moduleId: string;
  status: string;
  partnerId?: string;
  partnerName?: string;
}

interface ColegaData {
  pair?: Pair | null;
  moduleTitle?: string | null;
  colega?: { nombre: string; institucion?: string; cargo?: string; progreso?: number };
  miProgreso?: number;
  retoConjunto?: { titulo: string; descripcion: string };
  actividadReciente?: { titulo: string; fecha: string }[];
}

function CompletePairButton({ pairId, onCompleted }: { pairId: string; onCompleted: () => void }) {
  const [loading, setLoading] = useState(false);
  const handleComplete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/learning-pairs/${pairId}/complete`, { method: "POST", credentials: "include" });
      if (res.ok) onCompleted();
    } finally {
      setLoading(false);
    }
  };
  return (
    <button
      type="button"
      onClick={handleComplete}
      disabled={loading}
      style={{
        padding: "10px 18px",
        borderRadius: 12,
        border: "none",
        cursor: loading ? "wait" : "pointer",
        fontFamily: "'Raleway', sans-serif",
        fontSize: 12,
        fontWeight: 700,
        background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
        color: "white",
        boxShadow: "4px 4px 10px rgba(10,15,138,0.3)",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {loading ? "Guardando…" : "Marcar módulo completado en equipo"}
    </button>
  );
}

export default function MiColegaPage() {
  const [data, setData] = useState<ColegaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/learning-pairs/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const pair = d.pair ?? null;
        setData({
          pair,
          moduleTitle: d.moduleTitle ?? null,
          colega: pair?.partnerName
            ? { nombre: pair.partnerName, institucion: "Tu grupo", cargo: "Participante", progreso: 45 }
            : undefined,
          miProgreso: 52,
          retoConjunto: pair ? { titulo: "Reto del mes", descripcion: "Completar el módulo asignado en equipo antes del cierre." } : undefined,
          actividadReciente: pair ? [{ titulo: "Lección 1 completada", fecha: "Hace 2 días" }, { titulo: "Quiz módulo 1", fecha: "Hace 3 días" }] : undefined,
        });
      })
      .catch(() => setData({ pair: null }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setUserId(d.uid ?? null))
      .catch(() => {});
  }, []);

  const pair = data?.pair;
  const hasColega = !loading && pair && pair.status === "active";

  return (
    <div
      style={{
        flex: 1,
        padding: "24px 32px",
        background: "#e8eaf0",
        minHeight: "100vh",
        fontFamily: "'Raleway', sans-serif",
        maxWidth: 1100,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", marginBottom: 4 }}>Mi colega</h1>
      <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 28 }}>
        Aprende en pareja con otro participante del programa
      </p>

      {loading && <p style={{ fontSize: 13, color: "#8892b0" }}>Cargando…</p>}

      {!loading && !pair && (
        <div
          style={{
            background: "#e8eaf0",
            borderRadius: 20,
            padding: 48,
            textAlign: "center",
            maxWidth: 520,
            margin: "0 auto",
            boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              margin: "0 auto 20px",
              background: "#e8eaf0",
              boxShadow: "inset 4px 4px 10px #c2c8d6, inset -4px -4px 10px #ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-hidden
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8892b0" strokeWidth="2" strokeLinecap="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0a0f8a", marginBottom: 10 }}>
            Tu colega de aprendizaje aparecerá aquí pronto
          </h2>
          <p style={{ fontSize: 13, color: "#4a5580", lineHeight: 1.6, marginBottom: 24, fontFamily: "'Source Sans 3', sans-serif" }}>
            El sistema los emparejará según tu institución y cargo.
          </p>
          <FindColleague onMatched={(p) => setData((prev) => ({ ...prev, pair: p }))} />
        </div>
      )}

      {!loading && pair && pair.status !== "active" && !hasColega && (
        <div
          style={{
            background: "#e8eaf0",
            borderRadius: 20,
            padding: 40,
            textAlign: "center",
            boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
          }}
        >
          <p style={{ fontSize: 14, color: "#4a5580" }}>Activa la búsqueda para que te emparejemos con otro alumno.</p>
          <FindColleague onMatched={(p) => setData((prev) => ({ ...prev, pair: p }))} />
        </div>
      )}

      {hasColega && userId && data?.colega && (
        <>
          <div
            style={{
              background: "#e8eaf0",
              borderRadius: 20,
              padding: 28,
              marginBottom: 24,
              boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  background: "#e8eaf0",
                  boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
                aria-hidden
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1428d4" strokeWidth="2" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0a0f8a", marginBottom: 4 }}>{data.colega.nombre}</h2>
                <p style={{ fontSize: 12, color: "#8892b0", fontFamily: "'Space Mono', monospace" }}>{data.colega.institucion}</p>
                <p style={{ fontSize: 12, color: "#4a5580" }}>{data.colega.cargo}</p>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#8892b0", textTransform: "uppercase", letterSpacing: "1px", fontFamily: "'Space Mono', monospace", marginBottom: 10 }}>
                Comparación de avance
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 200px" }}>
                  <p style={{ fontSize: 11, color: "#4a5580", marginBottom: 4 }}>Tú</p>
                  <div style={{ height: 8, background: "#e8eaf0", borderRadius: 4, boxShadow: "inset 2px 2px 4px #c2c8d6", overflow: "hidden" }}>
                    <div style={{ width: `${data.miProgreso ?? 0}%`, height: "100%", background: "linear-gradient(90deg, #1428d4, #0a0f8a)", borderRadius: 4, transition: "width 0.4s ease" }} />
                  </div>
                  <p style={{ fontSize: 10, color: "#8892b0", fontFamily: "'Space Mono', monospace", marginTop: 4 }}>{data.miProgreso ?? 0}%</p>
                </div>
                <div style={{ flex: "1 1 200px" }}>
                  <p style={{ fontSize: 11, color: "#4a5580", marginBottom: 4 }}>{data.colega.nombre}</p>
                  <div style={{ height: 8, background: "#e8eaf0", borderRadius: 4, boxShadow: "inset 2px 2px 4px #c2c8d6", overflow: "hidden" }}>
                    <div style={{ width: `${data.colega.progreso ?? 0}%`, height: "100%", background: "linear-gradient(90deg, #00e5a0, #00b87d)", borderRadius: 4, transition: "width 0.4s ease" }} />
                  </div>
                  <p style={{ fontSize: 10, color: "#8892b0", fontFamily: "'Space Mono', monospace", marginTop: 4 }}>{data.colega.progreso ?? 0}%</p>
                </div>
              </div>
            </div>

            {data.retoConjunto && (
              <div
                style={{
                  padding: 16,
                  borderRadius: 14,
                  background: "rgba(20,40,212,0.06)",
                  borderLeft: "3px solid #1428d4",
                  marginBottom: 20,
                }}
              >
                <p style={{ fontSize: 11, fontWeight: 700, color: "#1428d4", fontFamily: "'Space Mono', monospace", marginBottom: 4 }}>Tu reto conjunto</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#0a0f8a" }}>{data.retoConjunto.titulo}</p>
                <p style={{ fontSize: 12, color: "#4a5580", marginTop: 4, fontFamily: "'Source Sans 3', sans-serif" }}>{data.retoConjunto.descripcion}</p>
              </div>
            )}

            {data.actividadReciente && data.actividadReciente.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#8892b0", textTransform: "uppercase", letterSpacing: "1px", fontFamily: "'Space Mono', monospace", marginBottom: 10 }}>
                  Últimas actividades de tu colega
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {data.actividadReciente.slice(0, 3).map((a, i) => (
                    <li
                      key={i}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: "#e8eaf0",
                        boxShadow: "inset 2px 2px 5px #c2c8d6, inset -2px -2px 5px #ffffff",
                        marginBottom: 8,
                        fontSize: 13,
                        color: "#4a5580",
                      }}
                    >
                      {a.titulo} <span style={{ fontSize: 11, color: "#8892b0", fontFamily: "'Space Mono', monospace" }}>· {a.fecha}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link
                href="/comunidad"
                style={{
                  padding: "12px 24px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
                  color: "white",
                  textDecoration: "none",
                  boxShadow: "4px 4px 10px rgba(10,15,138,0.3)",
                }}
              >
                Enviar mensaje
              </Link>
              <Link
                href="/portafolio"
                style={{
                  padding: "12px 24px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  background: "#e8eaf0",
                  color: "#1428d4",
                  textDecoration: "none",
                  boxShadow: "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
                }}
              >
                Ver su portafolio
              </Link>
              <CompletePairButton pairId={pair.id} onCompleted={() => setData((prev) => prev && prev.pair ? { ...prev, pair: { ...prev.pair, status: "completed" } } : prev)} />
            </div>
          </div>

          <div
            style={{
              background: "#e8eaf0",
              borderRadius: 18,
              padding: 24,
              boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 700, color: "#8892b0", marginBottom: 12, fontFamily: "'Space Mono', monospace" }}>Conversación</p>
            <PairChat pairId={pair.id} currentUserId={userId} pollIntervalMs={30000} />
            <Link
              href={pair.moduleId ? `/curso/modulos/${pair.moduleId}/recursos` : "/curso"}
              style={{ fontSize: 13, fontWeight: 600, color: "#1428d4", marginTop: 12, display: "inline-block" }}
            >
              Ir al módulo asignado →
            </Link>
          </div>
        </>
      )}

      {!loading && pair && pair.status === "completed" && (
        <div
          style={{
            background: "rgba(0,184,125,0.1)",
            borderRadius: 14,
            padding: 20,
            display: "flex",
            alignItems: "center",
            gap: 14,
            boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
          }}
        >
          <span style={{ fontSize: 28, color: "#00b87d" }} aria-hidden>✓</span>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#0a0f8a" }}>Módulo completado en equipo</p>
            <p style={{ fontSize: 13, color: "#4a5580", marginTop: 4 }}>Ambos recibieron el logro &quot;Aprendí en equipo&quot;.</p>
          </div>
        </div>
      )}
    </div>
  );
}
