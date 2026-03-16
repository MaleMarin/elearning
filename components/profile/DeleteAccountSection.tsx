"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteAccountSection() {
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "confirm" | "deleting" | "done">("idle");
  const [confirmText, setConfirmText] = useState("");

  const handleDelete = async () => {
    if (confirmText !== "ELIMINAR") return;
    setStep("deleting");
    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      setStep("done");
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setStep("confirm");
    }
  };

  if (step === "done") {
    return (
      <div
        style={{
          background: "#e8eaf0",
          borderRadius: 16,
          padding: 24,
          boxShadow: "5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 14, color: "#00b87d", fontWeight: 700 }}>
          ✓ Cuenta eliminada correctamente
        </p>
        <p style={{ fontSize: 12, color: "#8892b0", marginTop: 6 }}>Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#e8eaf0",
        borderRadius: 16,
        padding: 24,
        boxShadow: "5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff",
        border: "1px solid rgba(216,64,64,0.2)",
      }}
    >
      <h3
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#d84040",
          marginBottom: 8,
          fontFamily: "var(--font-heading)",
        }}
      >
        Eliminar mi cuenta
      </h3>
      <p
        style={{
          fontSize: 12,
          color: "#4a5580",
          marginBottom: 16,
          lineHeight: 1.6,
          fontFamily: "var(--font-heading)",
        }}
      >
        Esta acción es irreversible. Se eliminarán todos tus datos: progreso, portafolio, diario,
        logros y certificados.
      </p>

      {step === "idle" && (
        <button
          type="button"
          onClick={() => setStep("confirm")}
          style={{
            padding: "8px 18px",
            borderRadius: 10,
            border: "1px solid rgba(216,64,64,0.4)",
            cursor: "pointer",
            fontFamily: "var(--font-heading)",
            fontSize: 12,
            fontWeight: 600,
            background: "#e8eaf0",
            color: "#d84040",
            boxShadow: "3px 3px 7px #c2c8d6, -3px -3px 7px #ffffff",
          }}
        >
          Solicitar eliminación
        </button>
      )}

      {step === "confirm" && (
        <div>
          <p
            style={{
              fontSize: 12,
              color: "#d84040",
              marginBottom: 10,
              fontFamily: "'Space Mono', monospace",
            }}
          >
            Escribe ELIMINAR para confirmar:
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="ELIMINAR"
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 10,
              border: "none",
              background: "#e8eaf0",
              boxShadow: "inset 3px 3px 7px #c2c8d6, inset -3px -3px 7px #ffffff",
              fontSize: 13,
              fontFamily: "'Space Mono', monospace",
              color: "#0a0f8a",
              outline: "none",
              marginBottom: 12,
            }}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => {
                setStep("idle");
                setConfirmText("");
              }}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-heading)",
                fontSize: 12,
                fontWeight: 600,
                background: "#e8eaf0",
                color: "#4a5580",
                boxShadow: "3px 3px 7px #c2c8d6, -3px -3px 7px #ffffff",
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={confirmText !== "ELIMINAR"}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 10,
                border: "none",
                cursor: confirmText === "ELIMINAR" ? "pointer" : "not-allowed",
                fontFamily: "var(--font-heading)",
                fontSize: 12,
                fontWeight: 700,
                background: confirmText === "ELIMINAR" ? "#d84040" : "#e8eaf0",
                color: confirmText === "ELIMINAR" ? "white" : "#8892b0",
                boxShadow:
                  confirmText === "ELIMINAR"
                    ? "4px 4px 10px rgba(216,64,64,0.3)"
                    : "inset 3px 3px 7px #c2c8d6, inset -3px -3px 7px #ffffff",
              }}
            >
              Eliminar definitivamente
            </button>
          </div>
        </div>
      )}

      {step === "deleting" && (
        <p
          style={{
            fontSize: 12,
            color: "#8892b0",
            fontFamily: "'Space Mono', monospace",
          }}
        >
          Eliminando datos...
        </p>
      )}
    </div>
  );
}
