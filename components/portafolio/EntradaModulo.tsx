"use client";

export type Entrada = {
  moduloId: string;
  moduloTitulo: string;
  aprendizaje: string;
  reflexion: string;
  aplicacion: string;
  mood: string;
  updatedAt: string;
};

const NM = {
  bg: "#e8eaf0",
  elevated: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
  insetSm: "inset 2px 2px 5px #c2c8d6, inset -2px -2px 5px #ffffff",
};

const MOOD_MAP: Record<string, { emoji: string; label: string }> = {
  "1": { emoji: "😞", label: "Sin ganas" },
  "2": { emoji: "😕", label: "Pocas ganas" },
  "3": { emoji: "😐", label: "Neutro" },
  "4": { emoji: "😊", label: "Motivado" },
  "5": { emoji: "🔥", label: "Muy motivado" },
};

export function EntradaModulo({ entrada }: { entrada: Entrada }) {
  const moodInfo = entrada.mood ? MOOD_MAP[entrada.mood] : null;
  const moodText = moodInfo ? `${moodInfo.emoji} ${moodInfo.label}` : "—";
  const dateStr = entrada.updatedAt
    ? new Date(entrada.updatedAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })
    : "";

  return (
    <article
      style={{
        background: NM.bg,
        borderRadius: 20,
        padding: 24,
        boxShadow: NM.elevated,
        marginBottom: 16,
        fontFamily: "'Syne', sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: "1px solid rgba(194,200,214,0.3)",
        }}
      >
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#1428d4",
            boxShadow: "2px 2px 6px rgba(20,40,212,0.4)",
            flexShrink: 0,
          }}
        />
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0a0f8a", margin: 0 }}>
          {entrada.moduloTitulo || `Módulo ${entrada.moduloId}`}
        </h3>
      </div>

      {entrada.aprendizaje && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#8892b0", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4, fontFamily: "'Space Mono', monospace" }}>
            Aprendizaje clave
          </p>
          <p style={{ fontSize: 14, color: "#4a5580", lineHeight: 1.5, margin: 0 }}>"{entrada.aprendizaje}"</p>
        </div>
      )}

      {entrada.reflexion && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#8892b0", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4, fontFamily: "'Space Mono', monospace" }}>
            Mi reflexión
          </p>
          <p style={{ fontSize: 13, color: "#4a5580", lineHeight: 1.6, margin: 0 }}>{entrada.reflexion}</p>
        </div>
      )}

      {entrada.aplicacion && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#8892b0", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4, fontFamily: "'Space Mono', monospace" }}>
            Cómo lo apliqué en mi trabajo
          </p>
          <p style={{ fontSize: 13, color: "#4a5580", lineHeight: 1.6, margin: 0 }}>{entrada.aplicacion}</p>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, fontSize: 12, color: "#8892b0", fontFamily: "'Space Mono', monospace" }}>
        <span>Estado: {moodText}</span>
        <span>·</span>
        <span>{dateStr}</span>
      </div>
    </article>
  );
}
