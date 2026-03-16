"use client";

import { useState, useEffect } from "react";

interface Review {
  conceptId: string;
  conceptTitle: string;
  lessonId: string;
}

export default function SpacedRepCard() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [current, setCurrent] = useState(0);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    fetch("/api/repeticion", { credentials: "include" })
      .then((r) => {
        const ct = r.headers.get("content-type");
        if (!r.ok || !ct?.includes("application/json")) return { reviews: [] };
        return r.text().then((text) => (text ? JSON.parse(text) : { reviews: [] }));
      })
      .then((d) => setReviews(d.reviews || []))
      .catch(() => setReviews([]));
  }, []);

  const handleAnswer = async (remembered: boolean) => {
    if (!reviews[current]) return;
    await fetch("/api/repeticion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ conceptId: reviews[current].conceptId, remembered }),
    });
    setAnswered(true);
    setTimeout(() => {
      setCurrent((c) => c + 1);
      setAnswered(false);
    }, 800);
  };

  if (!reviews.length || current >= reviews.length) return null;

  const review = reviews[current];

  return (
    <div
      style={{
        background: "#e8eaf0",
        borderRadius: 18,
        padding: 20,
        marginBottom: 16,
        boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
        border: "1px solid rgba(0,229,160,0.3)",
      }}
    >
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#00b87d",
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          marginBottom: 10,
          fontFamily: "'Space Mono', monospace",
        }}
      >
        🔄 Repaso espaciado · {reviews.length - current} pendiente
        {reviews.length - current !== 1 ? "s" : ""}
      </p>
      <p
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#0a0f8a",
          marginBottom: 16,
          fontFamily: "var(--font-heading)",
        }}
      >
        ¿Recuerdas qué es: <span style={{ color: "#1428d4" }}>{review.conceptTitle}</span>?
      </p>
      {!answered ? (
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={() => handleAnswer(false)}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-heading)",
              fontSize: 12,
              fontWeight: 600,
              background: "#e8eaf0",
              color: "#d84040",
              boxShadow: "3px 3px 7px #c2c8d6, -3px -3px 7px #ffffff",
            }}
          >
            😕 No del todo
          </button>
          <button
            type="button"
            onClick={() => handleAnswer(true)}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-heading)",
              fontSize: 12,
              fontWeight: 700,
              background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
              color: "white",
              boxShadow: "4px 4px 10px rgba(10,15,138,0.35)",
            }}
          >
            ✓ Sí, lo recuerdo
          </button>
        </div>
      ) : (
        <p
          style={{
            fontSize: 12,
            color: "#00b87d",
            fontWeight: 600,
            textAlign: "center",
            fontFamily: "'Space Mono', monospace",
          }}
        >
          ✓ Guardado · Próximo repaso programado
        </p>
      )}
    </div>
  );
}
