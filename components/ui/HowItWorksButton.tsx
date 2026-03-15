"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

const GUIAS: Record<string, { titulo: string; pasos: string[] }> = {
  "/inicio": {
    titulo: "Cómo funciona el inicio",
    pasos: [
      "Aquí ves tu progreso y la siguiente lección que tienes pendiente.",
      "El botón 'Continuar' te lleva directo a donde lo dejaste.",
      "Los pasos de la derecha te guían en tu primera semana.",
      "La frase del día cambia cada jornada para inspirarte.",
    ],
  },
  "/curso": {
    titulo: "Cómo funciona el curso",
    pasos: [
      "El programa tiene 4 módulos que se desbloquean en orden.",
      "Completa cada módulo para avanzar al siguiente.",
      "Los módulos con 🔒 se desbloquean al terminar el anterior.",
      "El quiz al final de cada módulo refuerza lo aprendido.",
    ],
  },
  "/comunidad": {
    titulo: "Cómo funciona la comunidad",
    pasos: [
      "Comparte aprendizajes, preguntas y experiencias con tus compañeros.",
      "Puedes comentar en las publicaciones de otros.",
      "El glosario colaborativo lo construimos entre todos.",
      "Las mejores publicaciones aparecen destacadas.",
    ],
  },
  "/laboratorio": {
    titulo: "Cómo funciona El Laboratorio",
    pasos: [
      "Un espacio de exploración y juego sin calificaciones.",
      "Encuentra juegos, retos creativos y contenido extra.",
      "Nada aquí es obligatorio — entra cuando quieras.",
      "Ganas badges especiales por explorar cada zona.",
    ],
  },
  "/certificado": {
    titulo: "Tu certificado",
    pasos: [
      "El certificado se genera automáticamente al completar el 100%.",
      "Incluye un QR para que cualquier empleador lo verifique.",
      "Puedes descargarlo en formato horizontal o vertical.",
      "Compártelo directo en LinkedIn con un clic.",
    ],
  },
};

export default function HowItWorksButton() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const guiaKey =
    Object.keys(GUIAS).find((k) => pathname.startsWith(k)) ?? "/inicio";
  const guia = GUIAS[guiaKey];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: "24px",
          left: "24px",
          zIndex: 50,
          background: "#f0f2f5",
          border: "none",
          borderRadius: "50px",
          padding: "10px 18px",
          display: "flex",
          alignItems: "center",
          gap: "7px",
          fontSize: "12px",
          fontWeight: 600,
          color: "#1428d4",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          cursor: "pointer",
          boxShadow:
            "4px 4px 10px rgba(174,183,194,0.6), -4px -4px 10px rgba(255,255,255,0.85)",
          transition: "box-shadow 0.15s",
        }}
        aria-label="¿Cómo funciona esta sección?"
      >
        <span style={{ fontSize: "14px" }}>?</span>
        ¿Cómo funciona?
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="how-it-works-title"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(174,183,194,0.3)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#f0f2f5",
              borderRadius: "20px",
              padding: "28px 32px",
              maxWidth: "400px",
              width: "100%",
              boxShadow:
                "12px 12px 24px rgba(174,183,194,0.65), -12px -12px 24px rgba(255,255,255,0.9)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <span
                id="how-it-works-title"
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#1428d4",
                }}
              >
                {guia.titulo}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                style={{
                  background: "#f0f2f5",
                  border: "none",
                  borderRadius: "8px",
                  width: "28px",
                  height: "28px",
                  cursor: "pointer",
                  color: "#9ca3af",
                  fontSize: "16px",
                  fontWeight: 600,
                  boxShadow:
                    "inset 2px 2px 5px rgba(174,183,194,0.5), inset -2px -2px 5px rgba(255,255,255,0.75)",
                }}
              >
                ×
              </button>
            </div>
            {guia.pasos.map((paso, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "12px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: "#f0f2f5",
                    flexShrink: 0,
                    boxShadow:
                      "inset 2px 2px 4px rgba(174,183,194,0.5), inset -2px -2px 4px rgba(255,255,255,0.75)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#1428d4",
                  }}
                >
                  {i + 1}
                </div>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#4b5563",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {paso}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
