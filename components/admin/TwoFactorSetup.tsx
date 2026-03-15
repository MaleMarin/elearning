"use client";

import { useState } from "react";

interface TwoFactorSetupProps {
  onComplete: () => void;
}

export default function TwoFactorSetup({ onComplete }: TwoFactorSetupProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError("El código debe tener 6 dígitos");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        credentials: "include",
      });
      if (!res.ok) {
        setError("Código incorrecto. Intenta de nuevo.");
        return;
      }
      onComplete();
    } catch {
      setError("Error verificando el código");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#e8eaf0",
        borderRadius: 20,
        padding: 32,
        maxWidth: 400,
        margin: "0 auto",
        boxShadow: "8px 8px 20px #c2c8d6, -8px -8px 20px #ffffff",
        fontFamily: "'Syne', sans-serif",
      }}
    >
      <h2
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: "#0a0f8a",
          marginBottom: 8,
        }}
      >
        Verificación en dos pasos
      </h2>
      <p
        style={{
          fontSize: 13,
          color: "#4a5580",
          marginBottom: 24,
        }}
      >
        Ingresa el código de tu aplicación autenticadora.
      </p>
      <input
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={code}
        onChange={(e) => {
          setCode(e.target.value.replace(/\D/g, ""));
          setError("");
        }}
        placeholder="000000"
        style={{
          width: "100%",
          padding: "12px 16px",
          borderRadius: 12,
          border: "none",
          background: "#e8eaf0",
          boxShadow:
            "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff",
          fontSize: 22,
          textAlign: "center",
          letterSpacing: 8,
          fontFamily: "'Space Mono', monospace",
          color: "#0a0f8a",
          outline: "none",
          marginBottom: 8,
        }}
      />
      {error && (
        <p
          style={{
            fontSize: 11,
            color: "#d84040",
            marginBottom: 8,
            fontFamily: "'Space Mono', monospace",
          }}
        >
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={handleVerify}
        disabled={loading || code.length !== 6}
        style={{
          width: "100%",
          padding: 14,
          borderRadius: 13,
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "'Syne', sans-serif",
          fontSize: 13,
          fontWeight: 700,
          background:
            code.length === 6
              ? "linear-gradient(135deg, #1428d4, #0a0f8a)"
              : "#e8eaf0",
          color: code.length === 6 ? "white" : "#8892b0",
          boxShadow:
            code.length === 6
              ? "5px 5px 12px rgba(10,15,138,0.35)"
              : "inset 3px 3px 7px #c2c8d6, inset -3px -3px 7px #ffffff",
          marginTop: 8,
        }}
      >
        {loading ? "Verificando…" : "Verificar código"}
      </button>
    </div>
  );
}
