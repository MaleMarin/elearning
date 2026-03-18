"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Challenge = {
  id: string;
  titulo?: string;
  descripcion?: string;
  fechaFin?: string;
  estado?: string;
  equipos?: { nombre?: string; miembros?: string[]; propuesta?: string }[];
  ganador?: { equipoId?: string; nombre?: string } | null;
};

export default function RetoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id ?? "");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [entrega, setEntrega] = useState("");
  const [participando, setParticipando] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetch(`/api/retos/${id}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.challenge) setChallenge(d.challenge);
      })
      .catch(() => setChallenge(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUnirse = () => {
    fetch(`/api/retos/${id}/participar`, { method: "POST", credentials: "include" })
      .then((r) => r.json())
      .then(() => setParticipando(true));
  };

  const handleEntregar = () => {
    if (!entrega.trim()) return;
    router.push(`/reto/${id}`);
  };

  const baseLayout = {
    flex: 1,
    padding: "24px 32px",
    background: "#e8eaf0",
    minHeight: "100vh",
    fontFamily: "'Raleway', sans-serif",
    maxWidth: 1100,
    margin: "0 auto",
    width: "100%",
  } as const;

  if (loading) {
    return (
      <div style={baseLayout}>
        <p style={{ fontSize: 14, color: "#8892b0" }}>Cargando…</p>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div style={baseLayout}>
        <div style={{ background: "#e8eaf0", borderRadius: 20, padding: 40, textAlign: "center", boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0a0f8a", marginBottom: 8 }}>Reto no encontrado</h2>
          <Link href="/retos" style={{ fontSize: 14, fontWeight: 600, color: "#1428d4" }}>← Volver a retos</Link>
        </div>
      </div>
    );
  }

  const titulo = challenge.titulo ?? "Reto del grupo";
  const descripcion = challenge.descripcion ?? "";
  const fechaFin = challenge.fechaFin ? new Date(challenge.fechaFin).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" }) : null;
  const participantes = challenge.equipos?.flatMap((e) => e.miembros ?? []).length ?? 0;

  return (
    <div style={baseLayout}>
      <Link href="/retos" style={{ fontSize: 13, color: "#8892b0", marginBottom: 12, display: "inline-block" }}>
        ← Retos del grupo
      </Link>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", marginBottom: 8 }}>{titulo}</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        {fechaFin && (
          <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "#8892b0", padding: "4px 10px", borderRadius: 20, background: "rgba(194,200,214,0.3)" }}>
            Límite: {fechaFin}
          </span>
        )}
        <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "#1428d4", padding: "4px 10px", borderRadius: 20, background: "rgba(20,40,212,0.1)" }}>
          {participantes} participantes
        </span>
        {challenge.estado && (
          <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "#00b87d", padding: "4px 10px", borderRadius: 20, background: "rgba(0,229,160,0.1)" }}>
            {challenge.estado === "activo" ? "Abierto" : challenge.estado}
          </span>
        )}
      </div>

      <div style={{ background: "#e8eaf0", borderRadius: 20, padding: 28, marginBottom: 24, boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff" }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: "#8892b0", marginBottom: 12, fontFamily: "'Space Mono', monospace" }}>Descripción</h2>
        <p style={{ fontSize: 14, color: "#4a5580", lineHeight: 1.7, fontFamily: "'Source Sans 3', sans-serif" }}>{descripcion || "Sin descripción."}</p>
      </div>

      {challenge.ganador && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(0,229,160,0.15), rgba(0,184,125,0.1))",
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            borderLeft: "4px solid #00e5a0",
            boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, color: "#00b87d", fontFamily: "'Space Mono', monospace", marginBottom: 4 }}>Ganador</p>
          <p style={{ fontSize: 16, fontWeight: 800, color: "#0a0f8a" }}>🏆 {challenge.ganador.nombre ?? "Equipo ganador"}</p>
        </div>
      )}

      <div style={{ background: "#e8eaf0", borderRadius: 20, padding: 28, marginBottom: 24, boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff" }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: "#8892b0", marginBottom: 12, fontFamily: "'Space Mono', monospace" }}>Tu entrega</h2>
        <textarea
          value={entrega}
          onChange={(e) => setEntrega(e.target.value)}
          placeholder="Describe tu propuesta o entrega..."
          rows={4}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 12,
            border: "none",
            background: "#e8eaf0",
            boxShadow: "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff",
            fontSize: 14,
            color: "#0a0f8a",
            fontFamily: "'Source Sans 3', sans-serif",
            boxSizing: "border-box",
            resize: "vertical",
          }}
        />
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button
            type="button"
            onClick={handleEntregar}
            disabled={!entrega.trim()}
            style={{
              padding: "12px 24px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              fontFamily: "'Raleway', sans-serif",
              fontSize: 14,
              fontWeight: 700,
              background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
              color: "white",
              boxShadow: "4px 4px 10px rgba(10,15,138,0.3)",
            }}
          >
            Enviar entrega (ir a equipos)
          </button>
          {!participando && (
            <button
              type="button"
              onClick={handleUnirse}
              style={{
                padding: "12px 24px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                fontFamily: "'Raleway', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                background: "#e8eaf0",
                color: "#1428d4",
                boxShadow: "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
              }}
            >
              Unirme al reto
            </button>
          )}
        </div>
      </div>

      <div style={{ background: "#e8eaf0", borderRadius: 20, padding: 28, boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff" }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: "#8892b0", marginBottom: 12, fontFamily: "'Space Mono', monospace" }}>Participantes</h2>
        <p style={{ fontSize: 13, color: "#4a5580" }}>
          {participantes} personas participando en este reto. Las entregas son anónimas hasta que se declare el ganador.
        </p>
        <Link href={`/reto/${id}`} style={{ fontSize: 13, fontWeight: 600, color: "#1428d4", marginTop: 12, display: "inline-block" }}>
          Ver equipos y mensajes →
        </Link>
      </div>
    </div>
  );
}
