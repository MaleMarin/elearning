"use client";

import { useState } from "react";

interface Flashcard {
  frente: string;
  reverso: string;
}

export default function FlashcardDeck({ cards }: { cards: Flashcard[] }) {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState<number[]>([]);

  const card = cards[current];

  const handleKnow = () => {
    setDone((d) => [...d, current]);
    setFlipped(false);
    setCurrent((c) => (c + 1) % cards.length);
  };

  const handleRepeat = () => {
    setFlipped(false);
    setCurrent((c) => (c + 1) % cards.length);
  };

  if (cards.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 32, fontFamily: "'Syne', sans-serif" }}>
        <p style={{ fontSize: 14, color: "#4a5580" }}>No hay tarjetas para esta lección.</p>
      </div>
    );
  }

  if (done.length === cards.length) {
    return (
      <div style={{ textAlign: "center", padding: 32, fontFamily: "'Syne', sans-serif" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0a0f8a", marginBottom: 8 }}>
          ¡Completaste todas las tarjetas!
        </h3>
        <button
          type="button"
          onClick={() => {
            setDone([]);
            setCurrent(0);
            setFlipped(false);
          }}
          style={{
            marginTop: 16,
            padding: "10px 24px",
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            fontFamily: "'Syne', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
            color: "white",
            boxShadow: "4px 4px 10px rgba(10,15,138,0.3)",
          }}
        >
          Repasar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Syne', sans-serif" }}>
      <p
        style={{
          fontSize: 10,
          color: "#8892b0",
          fontFamily: "'Space Mono', monospace",
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          marginBottom: 14,
        }}
      >
        Tarjeta {current + 1} de {cards.length} · {done.length} dominadas
      </p>

      <div
        role="button"
        tabIndex={0}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setFlipped((f) => !f)}
        style={{
          background: flipped ? "linear-gradient(135deg, #0a0f8a, #1428d4)" : "#e8eaf0",
          borderRadius: 20,
          padding: 32,
          marginBottom: 20,
          cursor: "pointer",
          minHeight: 160,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: flipped
            ? "7px 7px 18px rgba(10,15,138,0.35), -4px -4px 12px rgba(255,255,255,0.6)"
            : "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
          transition: "all 0.3s ease",
        }}
      >
        <p
          style={{
            fontSize: 16,
            fontWeight: 700,
            textAlign: "center",
            color: flipped ? "white" : "#0a0f8a",
            lineHeight: 1.5,
          }}
        >
          {flipped ? card.reverso : card.frente}
        </p>
      </div>

      <p
        style={{
          fontSize: 11,
          color: "#8892b0",
          textAlign: "center",
          marginBottom: 16,
          fontFamily: "'Space Mono', monospace",
        }}
      >
        {flipped ? "Esta es la respuesta" : "Toca para revelar"}
      </p>

      {flipped && (
        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            onClick={handleRepeat}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 14,
              border: "none",
              cursor: "pointer",
              fontFamily: "'Syne', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              background: "#e8eaf0",
              color: "#d84040",
              boxShadow: "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
            }}
          >
            😕 Repasar
          </button>
          <button
            type="button"
            onClick={handleKnow}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 14,
              border: "none",
              cursor: "pointer",
              fontFamily: "'Syne', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
              color: "white",
              boxShadow: "4px 4px 10px rgba(10,15,138,0.3)",
            }}
          >
            ✓ Lo sé
          </button>
        </div>
      )}
    </div>
  );
}
