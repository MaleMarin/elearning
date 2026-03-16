"use client";

import { useState } from "react";
import type { Entrada } from "./EntradaModulo";

const NM = {
  bg: "#e8eaf0",
  elevated: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
  elevatedLg: "8px 8px 20px #c2c8d6, -8px -8px 20px #ffffff",
  inset: "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff",
  insetSm: "inset 2px 2px 5px #c2c8d6, inset -2px -2px 5px #ffffff",
};

const MOOD_OPTIONS = [
  { value: "1", emoji: "😞", label: "Sin ganas" },
  { value: "2", emoji: "😕", label: "Pocas ganas" },
  { value: "3", emoji: "😐", label: "Neutro" },
  { value: "4", emoji: "😊", label: "Motivado" },
  { value: "5", emoji: "🔥", label: "Muy motivado" },
];

type NuevaEntradaProps = {
  moduloId: string;
  moduloTitulo: string;
  onSave: (entrada: Entrada) => void;
  onClose: () => void;
};

export function NuevaEntrada({ moduloId, moduloTitulo, onSave, onClose }: NuevaEntradaProps) {
  const [aprendizaje, setAprendizaje] = useState("");
  const [reflexion, setReflexion] = useState("");
  const [aplicacion, setAplicacion] = useState("");
  const [mood, setMood] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/portafolio/entradas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          moduloId,
          moduloTitulo,
          aprendizaje: aprendizaje.slice(0, 120),
          reflexion: reflexion.slice(0, 500),
          aplicacion: aplicacion.slice(0, 500),
          mood,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      onSave({
        moduloId,
        moduloTitulo,
        aprendizaje: aprendizaje.slice(0, 120),
        reflexion: reflexion.slice(0, 500),
        aplicacion: aplicacion.slice(0, 500),
        mood,
        updatedAt: (data.entrada && data.entrada.updatedAt) ? data.entrada.updatedAt : new Date().toISOString(),
      });
      onClose();
    } catch {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(232,234,240,0.92)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: NM.bg,
          borderRadius: 24,
          padding: 32,
          width: "100%",
          maxWidth: 480,
          boxShadow: NM.elevatedLg,
          fontFamily: "var(--font-heading)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0a0f8a", margin: 0 }}>Nueva entrada · {moduloTitulo}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              background: NM.bg,
              border: "none",
              cursor: "pointer",
              width: 32,
              height: 32,
              borderRadius: 10,
              boxShadow: NM.elevated,
              color: "#8892b0",
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#8892b0", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6, display: "block", fontFamily: "'Space Mono', monospace" }}>
              Aprendizaje clave (máx. 120 caracteres)
            </span>
            <input
              type="text"
              value={aprendizaje}
              onChange={(e) => setAprendizaje(e.target.value)}
              maxLength={120}
              placeholder="Una frase que resuma tu aprendizaje"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 14,
                border: "none",
                background: NM.bg,
                boxShadow: NM.inset,
                fontFamily: "var(--font-heading)",
                fontSize: 13,
                color: "#0a0f8a",
              }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#8892b0", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6, display: "block", fontFamily: "'Space Mono', monospace" }}>
              Mi reflexión (máx. 500 caracteres)
            </span>
            <textarea
              value={reflexion}
              onChange={(e) => setReflexion(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Escribe tu reflexión sobre el módulo"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 14,
                border: "none",
                background: NM.bg,
                boxShadow: NM.inset,
                fontFamily: "var(--font-heading)",
                fontSize: 13,
                color: "#0a0f8a",
                resize: "vertical",
              }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#8892b0", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6, display: "block", fontFamily: "'Space Mono', monospace" }}>
              Cómo lo apliqué en mi trabajo (máx. 500 caracteres)
            </span>
            <textarea
              value={aplicacion}
              onChange={(e) => setAplicacion(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Describe cómo aplicaste lo aprendido"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 14,
                border: "none",
                background: NM.bg,
                boxShadow: NM.inset,
                fontFamily: "var(--font-heading)",
                fontSize: 13,
                color: "#0a0f8a",
                resize: "vertical",
              }}
            />
          </label>

          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#8892b0", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8, display: "block", fontFamily: "'Space Mono', monospace" }}>
              Estado emocional del módulo
            </span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {MOOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMood(opt.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 14,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "var(--font-heading)",
                    fontSize: 13,
                    fontWeight: 600,
                    background: mood === opt.value ? "rgba(20,40,212,0.06)" : NM.bg,
                    boxShadow: mood === opt.value ? NM.insetSm : NM.elevated,
                    color: mood === opt.value ? "#1428d4" : "#4a5580",
                  }}
                >
                  {opt.emoji} {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 14,
              border: "none",
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "var(--font-heading)",
              fontSize: 13,
              fontWeight: 700,
              background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
              color: "white",
              boxShadow: "5px 5px 12px rgba(10,15,138,0.35), -3px -3px 8px rgba(255,255,255,0.7)",
            }}
          >
            {saving ? "Guardando…" : "Guardar en mi portafolio"}
          </button>
        </form>
      </div>
    </div>
  );
}
