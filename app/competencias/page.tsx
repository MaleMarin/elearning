"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type CompetenciaPerfil = {
  id: string;
  nombre: string;
  nivelEntrada: string;
  nivelSalida: string;
  valueEntrada: number;
  valueSalida: number;
};

const RADAR_SIZE = 320;
const RADAR_CX = RADAR_SIZE / 2;
const RADAR_CY = RADAR_SIZE / 2;
const RADAR_R = (RADAR_SIZE / 2) * 0.78;
const MAX_VALUE = 3;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function radarPolygonPoints(values: number[], cx: number, cy: number, r: number): string {
  const n = values.length;
  return values
    .map((v, i) => {
      const angle = (360 / n) * i;
      const radius = (v / MAX_VALUE) * r;
      const p = polarToCartesian(cx, cy, radius, angle + 90);
      return `${p.x},${p.y}`;
    })
    .join(" ");
}

function RadarChart({ competencias }: { competencias: CompetenciaPerfil[] }) {
  const labels = competencias.map((c) => c.nombre);
  const valuesEntrada = competencias.map((c) => c.valueEntrada);
  const valuesSalida = competencias.map((c) => c.valueSalida);
  const n = labels.length;
  const gridLevels = [1, 2, 3];

  return (
    <svg
      viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`}
      style={{ width: "100%", maxWidth: 320, height: "auto" }}
      aria-label="Gráfico radar de competencias SPC"
    >
      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={radarPolygonPoints(Array(n).fill(level), RADAR_CX, RADAR_CY, RADAR_R)}
          fill="none"
          stroke="#c2c8d6"
          strokeWidth="1"
        />
      ))}
      {labels.map((_, i) => {
        const angle = (360 / n) * i;
        const end = polarToCartesian(RADAR_CX, RADAR_CY, RADAR_R, angle + 90);
        return (
          <line
            key={i}
            x1={RADAR_CX}
            y1={RADAR_CY}
            x2={end.x}
            y2={end.y}
            stroke="#c2c8d6"
            strokeWidth="1"
          />
        );
      })}
      {labels.map((label, i) => {
        const angle = (360 / n) * i;
        const labelR = RADAR_R + 18;
        const p = polarToCartesian(RADAR_CX, RADAR_CY, labelR, angle + 90);
        const short = label.length > 18 ? label.slice(0, 16) + "…" : label;
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fill: "#4a5580", fontSize: 10, fontFamily: "'Raleway', sans-serif", fontWeight: 600 }}
          >
            {short}
          </text>
        );
      })}
      <polygon
        points={radarPolygonPoints(valuesEntrada, RADAR_CX, RADAR_CY, RADAR_R)}
        fill="rgba(20,40,212,0.2)"
        stroke="#1428d4"
        strokeWidth="2"
        strokeDasharray="4 3"
      />
      <polygon
        points={radarPolygonPoints(valuesSalida, RADAR_CX, RADAR_CY, RADAR_R)}
        fill="rgba(0,229,160,0.25)"
        stroke="#00e5a0"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function CompetenciasPage() {
  const [competencias, setCompetencias] = useState<CompetenciaPerfil[]>([]);
  const [courseName, setCourseName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile/competencias", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          if (Array.isArray(data.competencias)) setCompetencias(data.competencias);
          if (data.courseName) setCourseName(data.courseName);
        }
      })
      .catch(() => setError("Error al cargar competencias"))
      .finally(() => setLoading(false));
  }, []);

  const baseLayout = {
    flex: 1,
    padding: "24px 32px",
    background: "#e8eaf0",
    minHeight: "100vh",
    fontFamily: "'Raleway', sans-serif",
    maxWidth: 1100,
    margin: "0 auto",
    width: "100%",
  } as const;

  if (loading) {
    return (
      <div style={baseLayout}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", marginBottom: 4 }}>Competencias SPC</h1>
        <p style={{ fontSize: 13, color: "#8892b0" }}>Cargando…</p>
      </div>
    );
  }

  return (
    <div style={baseLayout}>
      <Link href="/mi-perfil" style={{ fontSize: 13, color: "#8892b0", marginBottom: 12, display: "inline-block" }}>
        ← Mi perfil
      </Link>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", marginBottom: 4 }}>Competencias SPC</h1>
      <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 28, fontFamily: "'Source Sans 3', sans-serif" }}>
        Comparativo de competencias del Servicio Profesional de Carrera: nivel al entrar (diagnóstico) y nivel al salir (desarrolladas en el programa).
        {courseName && <span style={{ display: "block", marginTop: 6 }}>Programa: {courseName}</span>}
      </p>

      {error && !String(error).includes("FIREBASE") && (
        <div style={{ padding: 16, borderRadius: 14, background: "rgba(216,64,64,0.08)", color: "#d84040", marginBottom: 24 }} role="alert">
          {String(error)}
        </div>
      )}

      {competencias.length === 0 && !error && (
        <div
          style={{
            background: "#e8eaf0",
            borderRadius: 20,
            padding: 40,
            textAlign: "center",
            boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
          }}
        >
          <p style={{ fontSize: 14, color: "#8892b0" }}>No hay datos de competencias para mostrar. Completa lecciones del programa para que se reflejen aquí.</p>
          <Link href="/curso" style={{ display: "inline-block", marginTop: 16, fontSize: 13, fontWeight: 600, color: "#1428d4" }}>Ir al curso</Link>
        </div>
      )}

      {competencias.length > 0 && (
        <>
          <div
            style={{
              background: "#e8eaf0",
              borderRadius: 20,
              padding: 28,
              marginBottom: 24,
              boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
            }}
          >
            <p style={{ fontSize: 11, fontWeight: 700, color: "#8892b0", fontFamily: "'Space Mono', monospace", marginBottom: 8 }}>Visualización</p>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0a0f8a", marginBottom: 20 }}>Radar de competencias</h2>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <RadarChart competencias={competencias} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 24, fontSize: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 16, height: 16, borderRadius: 4, border: "2px solid #1428d4", background: "rgba(20,40,212,0.15)" }} aria-hidden />
                Nivel al entrar (diagnóstico)
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 16, height: 16, borderRadius: 4, border: "2px solid #00e5a0", background: "rgba(0,229,160,0.2)" }} aria-hidden />
                Nivel al salir (programa)
              </span>
            </div>
          </div>

          <div
            style={{
              background: "#e8eaf0",
              borderRadius: 20,
              padding: 28,
              boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
            }}
          >
            <p style={{ fontSize: 11, fontWeight: 700, color: "#8892b0", fontFamily: "'Space Mono', monospace", marginBottom: 8 }}>Detalle</p>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0a0f8a", marginBottom: 16 }}>Por competencia</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {competencias.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "14px 18px",
                    borderRadius: 14,
                    background: "#e8eaf0",
                    boxShadow: "inset 2px 2px 5px #c2c8d6, inset -2px -2px 5px #ffffff",
                  }}
                >
                  <div style={{ flex: "1 1 40%", minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#0a0f8a" }}>{c.nombre}</p>
                  </div>
                  <div style={{ flex: "1 1 30%", display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 8, borderRadius: 4, background: "#e8eaf0", boxShadow: "inset 2px 2px 4px #c2c8d6", overflow: "hidden" }}>
                      <div style={{ width: `${(c.valueEntrada / MAX_VALUE) * 100}%`, height: "100%", background: "#1428d4", borderRadius: 4, transition: "width 0.4s ease" }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#8892b0", fontFamily: "'Space Mono', monospace", minWidth: 60 }}>{c.nivelEntrada}</span>
                  </div>
                  <div style={{ flex: "1 1 30%", display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 8, borderRadius: 4, background: "#e8eaf0", boxShadow: "inset 2px 2px 4px #c2c8d6", overflow: "hidden" }}>
                      <div style={{ width: `${(c.valueSalida / MAX_VALUE) * 100}%`, height: "100%", background: "#00e5a0", borderRadius: 4, transition: "width 0.4s ease" }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#00b87d", fontFamily: "'Space Mono', monospace", minWidth: 60 }}>{c.nivelSalida}</span>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ marginTop: 16, fontSize: 11, color: "#8892b0", fontFamily: "'Space Mono', monospace" }}>
              Referencia: Acuerdo SFP DOF 2025 · Servicio Profesional de Carrera (México).
            </p>
          </div>
        </>
      )}
    </div>
  );
}
