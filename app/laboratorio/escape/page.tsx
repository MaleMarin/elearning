"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

interface Scene {
  id: string;
  texto: string;
  opciones: { texto: string; siguiente: string; esCorrecta?: boolean }[];
  esFinale?: boolean;
  resultado?: "exito" | "fracaso";
}

const ESCENARIO: Record<string, Scene> = {
  inicio: {
    id: "inicio",
    texto:
      "🚨 Alerta: Tu sistema detecta actividad sospechosa a las 2:00 AM. Recibes una notificación de que alguien intentó acceder a la base de datos de ciudadanos. ¿Qué haces primero?",
    opciones: [
      { texto: "🔒 Aislar inmediatamente el servidor afectado", siguiente: "aislamiento", esCorrecta: true },
      { texto: "📧 Enviar un correo al equipo para reportar", siguiente: "correo_lento" },
      { texto: "😴 Esperar a mañana para revisarlo", siguiente: "espera_fatal" },
    ],
  },
  aislamiento: {
    id: "aislamiento",
    texto:
      "✅ Correcto. Aislaste el servidor. Ahora descubres que el atacante intentó extraer datos de 50,000 ciudadanos. ¿Cuál es tu siguiente paso?",
    opciones: [
      { texto: "📋 Notificar al INAI según la LFPDPPP", siguiente: "notificacion_correcta", esCorrecta: true },
      { texto: "🤫 Resolver internamente sin notificar", siguiente: "ocultamiento" },
      { texto: "🔧 Solo arreglar el sistema sin reportar", siguiente: "sin_reporte" },
    ],
  },
  notificacion_correcta: {
    id: "notificacion_correcta",
    texto:
      "🏆 ¡Excelente! Notificaste al INAI dentro de las 72 horas que exige la ley y protegiste los derechos de los ciudadanos. Tu institución cumple con la LFPDPPP.",
    opciones: [],
    esFinale: true,
    resultado: "exito",
  },
  correo_lento: {
    id: "correo_lento",
    texto:
      "⚠️ El correo tardó 6 horas en leerse. Durante ese tiempo el atacante extrajo 10,000 registros más. El tiempo importa en ciberseguridad.",
    opciones: [{ texto: "↩️ Volver a intentar desde el inicio", siguiente: "inicio" }],
  },
  espera_fatal: {
    id: "espera_fatal",
    texto:
      "💥 Al día siguiente aparece en noticias que datos de ciudadanos fueron vendidos en la dark web. Tu institución enfrenta una multa del INAI.",
    opciones: [{ texto: "↩️ Volver a intentar desde el inicio", siguiente: "inicio" }],
    esFinale: true,
    resultado: "fracaso",
  },
  ocultamiento: {
    id: "ocultamiento",
    texto:
      "💥 Tres meses después, el INAI descubrió la brecha. La multa por no reportar fue de 2 millones de pesos y tu cargo está en riesgo.",
    opciones: [{ texto: "↩️ Volver a intentar", siguiente: "inicio" }],
    esFinale: true,
    resultado: "fracaso",
  },
  sin_reporte: {
    id: "sin_reporte",
    texto:
      "⚠️ Arreglaste el sistema pero sin notificar. Los ciudadanos cuyos datos fueron comprometidos nunca lo sabrán. Esto viola el Art. 20 de la LFPDPPP.",
    opciones: [{ texto: "↩️ Volver a intentar", siguiente: "inicio" }],
    esFinale: true,
    resultado: "fracaso",
  },
};

export default function EscapeRoomPage() {
  const [sceneId, setSceneId] = useState("inicio");
  const [history, setHistory] = useState<string[]>(["inicio"]);
  const scene = ESCENARIO[sceneId];

  const handleChoice = (siguiente: string) => {
    setSceneId(siguiente);
    setHistory((h) => [...h, siguiente]);
  };

  const handleRestart = () => {
    setSceneId("inicio");
    setHistory(["inicio"]);
  };

  return (
    <DashboardShell subtitle="// Simulador de crisis · Ciberseguridad">
      <div style={{ maxWidth: 680, margin: "0 auto", fontFamily: "var(--font-heading)" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #0a0f8a, #1428d4)",
            borderRadius: 20,
            padding: "24px",
            marginBottom: 24,
            boxShadow:
              "7px 7px 18px rgba(10,15,138,0.35), -4px -4px 12px rgba(255,255,255,0.6)",
          }}
        >
          <p
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.6)",
              fontFamily: "'Space Mono', monospace",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              marginBottom: 6,
            }}
          >
            Simulador de decisiones · Módulo 3
          </p>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "white", letterSpacing: "-0.3px" }}>
            Crisis de Ciberseguridad
          </h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
            Paso {history.length} · Tus decisiones tienen consecuencias reales
          </p>
        </div>

        <div
          style={{
            background: "#e8eaf0",
            borderRadius: 20,
            padding: 28,
            marginBottom: 20,
            boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
          }}
        >
          <p style={{ fontSize: 15, color: "#0a0f8a", lineHeight: 1.7, fontWeight: 500 }}>
            {scene.texto}
          </p>
        </div>

        {scene.opciones.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {scene.opciones.map((op, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleChoice(op.siguiente)}
                style={{
                  padding: "16px 20px",
                  borderRadius: 14,
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "var(--font-heading)",
                  fontSize: 14,
                  fontWeight: 600,
                  background: "#e8eaf0",
                  color: "#0a0f8a",
                  boxShadow: "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
                  transition: "all 0.15s ease",
                }}
              >
                {op.texto}
              </button>
            ))}
          </div>
        )}

        {scene.esFinale && (
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>
              {scene.resultado === "exito" ? "🏆" : "💥"}
            </div>
            <p
              style={{
                fontSize: 14,
                color: scene.resultado === "exito" ? "#00b87d" : "#d84040",
                fontWeight: 700,
                marginBottom: 20,
              }}
            >
              {scene.resultado === "exito"
                ? "¡Tomaste las decisiones correctas!"
                : "Resultado negativo — aprende de este escenario"}
            </p>
            <button
              type="button"
              onClick={handleRestart}
              style={{
                padding: "12px 28px",
                borderRadius: 14,
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-heading)",
                fontSize: 13,
                fontWeight: 700,
                background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
                color: "white",
                boxShadow: "5px 5px 12px rgba(10,15,138,0.35)",
              }}
            >
              Volver a intentar →
            </button>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
