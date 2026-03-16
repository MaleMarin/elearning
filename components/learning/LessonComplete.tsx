"use client";

import { useEffect, useState } from "react";

interface LessonCompleteProps {
  lessonTitle: string;
  xp?: number;
  onContinue: () => void;
}

export default function LessonComplete({
  lessonTitle,
  xp = 10,
  onContinue,
}: LessonCompleteProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(232,234,240,0.95)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          background: "#e8eaf0",
          borderRadius: 24,
          padding: 40,
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
          boxShadow: "10px 10px 24px #c2c8d6, -10px -10px 24px #ffffff",
          transform: visible ? "scale(1)" : "scale(0.8)",
          opacity: visible ? 1 : 0,
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          fontFamily: "var(--font-heading)",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(0,229,160,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
            fontSize: 36,
          }}
        >
          ✅
        </div>

        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#0a0f8a",
            marginBottom: 8,
            letterSpacing: "-0.5px",
          }}
        >
          ¡Lección completada!
        </h2>
        <p style={{ fontSize: 14, color: "#4a5580", marginBottom: 6 }}>{lessonTitle}</p>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(0,229,160,0.12)",
            borderRadius: 20,
            padding: "6px 16px",
            margin: "16px 0",
          }}
        >
          <span style={{ fontSize: 18 }}>⚡</span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#00b87d",
              fontFamily: "'Space Mono', monospace",
            }}
          >
            +{xp} XP
          </span>
        </div>

        <button
          type="button"
          onClick={onContinue}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 14,
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-heading)",
            fontSize: 14,
            fontWeight: 700,
            background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
            color: "white",
            boxShadow:
              "5px 5px 14px rgba(10,15,138,0.38), -3px -3px 9px rgba(255,255,255,0.7)",
            marginTop: 8,
          }}
        >
          Continuar →
        </button>
      </div>
    </div>
  );
}
