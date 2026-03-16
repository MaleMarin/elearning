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
        fontFamily: "var(--font-heading)",
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
  const [pair, setPair] = useState<Pair | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/learning-pairs/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setPair(d.pair ?? null);
        setModuleTitle(d.moduleTitle ?? null);
      })
      .catch(() => setPair(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setUserId(d.uid ?? null))
      .catch(() => {});
  }, []);

  return (
    <div style={{ flex: 1, padding: "20px 20px", background: "#e8eaf0", minHeight: "100vh", fontFamily: "var(--font-heading)" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/inicio" style={{ fontSize: 13, color: "#8892b0", marginBottom: 8, display: "inline-block" }}>← Inicio</Link>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", letterSpacing: "-0.5px" }}>Mi colega</h1>
        <p style={{ fontSize: 13, color: "#8892b0", marginTop: 4 }}>Aprende en pareja con otro participante del programa</p>
      </div>

      <div
        style={{
          background: "#e8eaf0",
          borderRadius: 20,
          padding: 24,
          boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
        }}
      >
        {!loading && !pair && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p style={{ fontSize: 14, color: "#4a5580", marginBottom: 20 }}>
              Activa la búsqueda para que te emparejemos con otro alumno y completen un módulo juntos.
            </p>
            <FindColleague onMatched={(p) => setPair(p)} />
          </div>
        )}

        {!loading && pair && pair.status === "active" && userId && (
          <>
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: "#1428d4", fontFamily: "'Space Mono', monospace", marginBottom: 4 }}>Tu pareja de aprendizaje</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#0a0f8a" }}>{pair.partnerName ?? "Compañero asignado"}</p>
            </div>
            <PairChat pairId={pair.id} currentUserId={userId} pollIntervalMs={30000} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20, alignItems: "center" }}>
              <Link
                href={`/curso/modulos/${pair.moduleId}/recursos`}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1428d4",
                  textDecoration: "none",
                }}
              >
                Ir al módulo asignado →
              </Link>
              <CompletePairButton pairId={pair.id} onCompleted={() => setPair((p) => (p ? { ...p, status: "completed" } : null))} />
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
            }}
          >
            <span style={{ fontSize: 28 }}>✓</span>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#0a0f8a" }}>Módulo completado en equipo</p>
              <p style={{ fontSize: 13, color: "#4a5580", marginTop: 4 }}>Ambos recibieron el logro &quot;Aprendí en equipo&quot;.</p>
            </div>
          </div>
        )}
      </div>

      {!loading && !pair && (
        <div
          style={{
            background: "#e8eaf0",
            borderRadius: 16,
            padding: 24,
            marginTop: 16,
            textAlign: "center",
            boxShadow: "5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff",
          }}
        >
          <p style={{ fontSize: 13, color: "#8892b0" }}>Tu colega de aprendizaje aparecerá aquí cuando te emparejemos.</p>
        </div>
      )}
    </div>
  );
}
