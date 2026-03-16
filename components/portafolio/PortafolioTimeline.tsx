"use client";

import { EntradaModulo, type Entrada } from "./EntradaModulo";

const NM = {
  bg: "#e8eaf0",
  elevated: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
  inset: "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff",
};

type PortafolioTimelineProps = {
  entradas: Entrada[];
  onNuevaEntrada: (moduloId: string, moduloTitulo: string) => void;
};

const MODULOS_DEMO = [
  { id: "mod1", titulo: "Módulo 1 · Introducción al Gobierno Digital" },
  { id: "mod2", titulo: "Módulo 2 · Datos y transparencia" },
  { id: "mod3", titulo: "Módulo 3 · Ciberseguridad" },
];

export function PortafolioTimeline({ entradas, onNuevaEntrada }: PortafolioTimelineProps) {
  return (
    <div style={{ display: "flex", gap: 24, fontFamily: "var(--font-heading)" }}>
      {/* Línea lateral */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        {entradas.length > 0 ? (
          <>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "#1428d4",
                boxShadow: NM.elevated,
                flexShrink: 0,
              }}
            />
            <div style={{ width: 2, flex: 1, minHeight: 20, background: "rgba(194,200,214,0.5)", margin: "4px 0" }} />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: NM.bg,
                boxShadow: NM.inset,
                flexShrink: 0,
              }}
            />
          </>
        ) : null}
      </div>

      {/* Cards */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {entradas.map((entrada) => (
          <EntradaModulo key={entrada.moduloId} entrada={entrada} />
        ))}

        {/* Botón agregar por módulo */}
        <div style={{ marginTop: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#8892b0", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12, fontFamily: "'Space Mono', monospace" }}>
            Agregar entrada por módulo
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {MODULOS_DEMO.map((mod) => (
              <button
                key={mod.id}
                type="button"
                onClick={() => onNuevaEntrada(mod.id, mod.titulo)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 14,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-heading)",
                  fontSize: 12,
                  fontWeight: 600,
                  background: NM.bg,
                  boxShadow: NM.elevated,
                  color: "#1428d4",
                }}
              >
                + {mod.titulo}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
