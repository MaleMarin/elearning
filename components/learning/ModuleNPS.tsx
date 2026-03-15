"use client";

import { useState } from "react";

interface ModuleNPSProps {
  moduloId: string;
  moduloTitulo: string;
  onComplete: () => void;
}

export default function ModuleNPS({ moduloId, moduloTitulo, onComplete }: ModuleNPSProps) {
  const [score, setScore] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (score === null) return;
    await fetch("/api/nps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ moduloId, score }),
    });
    setSubmitted(true);
    setTimeout(onComplete, 1500);
  };

  const getLabel = (n: number) => {
    if (n <= 3) return "No lo recomendaría";
    if (n <= 6) return "Tal vez";
    if (n <= 8) return "Probablemente sí";
    return "Definitivamente sí";
  };

  const getColor = (n: number, selected: number | null) => {
    if (selected !== n) return "#e8eaf0";
    if (n <= 3) return "#d84040";
    if (n <= 6) return "#c89000";
    return "#00b87d";
  };

  if (submitted) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: 32,
          fontFamily: "'Syne', sans-serif",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>🙏</div>
        <p style={{ fontSize: 16, fontWeight: 700, color: "#0a0f8a" }}>
          ¡Gracias por tu opinión!
        </p>
        <p style={{ fontSize: 13, color: "#4a5580", marginTop: 6 }}>
          Tu feedback nos ayuda a mejorar.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#e8eaf0",
        borderRadius: 20,
        padding: 32,
        boxShadow: "8px 8px 18px #c2c8d6, -8px -8px 18px #ffffff",
        fontFamily: "'Syne', sans-serif",
        maxWidth: 500,
        margin: "0 auto",
      }}
    >
      <h2
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: "#0a0f8a",
          marginBottom: 6,
          letterSpacing: "-0.3px",
        }}
      >
        ¿Recomendarías este módulo?
      </h2>
      <p style={{ fontSize: 13, color: "#4a5580", marginBottom: 24 }}>
        {moduloTitulo} · Del 1 (no) al 10 (definitivamente sí)
      </p>

      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setScore(n)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontFamily: "'Space Mono', monospace",
              fontSize: 13,
              fontWeight: 700,
              background: getColor(n, score),
              color: score === n ? "white" : "#4a5580",
              boxShadow:
                score === n
                  ? "3px 3px 8px rgba(0,0,0,0.2)"
                  : "3px 3px 7px #c2c8d6, -3px -3px 7px #ffffff",
              transition: "all 0.15s",
            }}
          >
            {n}
          </button>
        ))}
      </div>

      {score !== null && (
        <p
          style={{
            fontSize: 12,
            color: "#4a5580",
            marginBottom: 16,
            fontStyle: "italic",
          }}
        >
          {getLabel(score)}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={score === null}
        style={{
          width: "100%",
          padding: 14,
          borderRadius: 14,
          border: "none",
          cursor: score !== null ? "pointer" : "not-allowed",
          fontFamily: "'Syne', sans-serif",
          fontSize: 13,
          fontWeight: 700,
          background:
            score !== null
              ? "linear-gradient(135deg, #1428d4, #0a0f8a)"
              : "#e8eaf0",
          color: score !== null ? "white" : "#8892b0",
          boxShadow:
            score !== null
              ? "5px 5px 12px rgba(10,15,138,0.35)"
              : "inset 3px 3px 7px #c2c8d6, inset -3px -3px 7px #ffffff",
        }}
      >
        Enviar opinión
      </button>
    </div>
  );
}
