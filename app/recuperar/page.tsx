"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { sendPasswordResetEmail } from "firebase/auth";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setError("");
    if (!email.trim()) return;
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      if (!auth) {
        setError("No se pudo conectar con el servicio. Intenta de nuevo.");
        return;
      }
      await sendPasswordResetEmail(auth, email.trim());
      setEnviado(true);
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "code" in e
        ? String((e as { code: string }).code)
        : "";
      setError(
        msg && (msg.includes("user-not-found") || msg.includes("invalid-email"))
          ? "No encontramos una cuenta con ese correo."
          : "No pudimos enviar el correo. Revisa la dirección e intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#e8eaf0" }}>
      <div
        style={{
          width: 400,
          background: "linear-gradient(135deg, #0a0f8a, #1428d4)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 48,
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "white", marginBottom: 12, fontFamily: "'Raleway', sans-serif" }}>
          Política Digital
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, fontFamily: "'Source Sans 3', sans-serif" }}>
          Te ayudamos a recuperar el acceso a tu cuenta de formación.
        </p>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: 400,
            background: "#e8eaf0",
            borderRadius: 24,
            padding: 40,
            boxShadow: "8px 8px 20px #c2c8d6, -8px -8px 20px #ffffff",
          }}
        >
          {!enviado ? (
            <>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", marginBottom: 8, fontFamily: "'Raleway', sans-serif" }}>
                Recuperar contraseña
              </h2>
              <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 28, lineHeight: 1.6, fontFamily: "'Source Sans 3', sans-serif" }}>
                Ingresa tu correo y te enviaremos las instrucciones.
              </p>

              <div style={{ marginBottom: 20 }}>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#8892b0",
                    fontFamily: "'Space Mono', monospace",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: 8,
                  }}
                >
                  Correo electrónico
                </p>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@gobierno.gob.mx"
                  type="email"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    borderRadius: 12,
                    border: "none",
                    background: "#e8eaf0",
                    outline: "none",
                    fontSize: 14,
                    color: "#0a0f8a",
                    boxShadow: "inset 4px 4px 10px #c2c8d6, inset -4px -4px 10px #ffffff",
                    fontFamily: "'Source Sans 3', sans-serif",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {error && (
                <p style={{ fontSize: 12, color: "#d84040", marginBottom: 12, fontFamily: "'Source Sans 3', sans-serif" }}>
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: 14,
                  borderRadius: 14,
                  border: "none",
                  cursor: loading ? "wait" : "pointer",
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: 15,
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
                  color: "white",
                  boxShadow: "5px 5px 14px rgba(10,15,138,0.35)",
                  marginBottom: 16,
                }}
              >
                {loading ? "Enviando…" : "Enviar instrucciones"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/login")}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  background: "#e8eaf0",
                  color: "#4a5580",
                  boxShadow: "3px 3px 8px #c2c8d6, -3px -3px 8px #ffffff",
                }}
              >
                ← Volver al login
              </button>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }} aria-hidden>📬</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0a0f8a", marginBottom: 10, fontFamily: "'Raleway', sans-serif" }}>
                Revisa tu correo
              </h3>
              <p style={{ fontSize: 13, color: "#4a5580", lineHeight: 1.7, marginBottom: 24, fontFamily: "'Source Sans 3', sans-serif" }}>
                Enviamos las instrucciones a <strong>{email}</strong>
              </p>
              <button
                type="button"
                onClick={() => router.push("/login")}
                style={{
                  padding: "12px 28px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  background: "#e8eaf0",
                  color: "#1428d4",
                  boxShadow: "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
                }}
              >
                Ir al login →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
