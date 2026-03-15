"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { CompetenciaPerfil } from "@/app/api/profile/competencias/route";

const RADAR_SIZE = 320;
const RADAR_CX = RADAR_SIZE / 2;
const RADAR_CY = RADAR_SIZE / 2;
const RADAR_R = (RADAR_SIZE / 2) * 0.78;
const MAX_VALUE = 3;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function radarPolygonPoints(
  values: number[],
  cx: number,
  cy: number,
  r: number
): string {
  const n = values.length;
  return values
    .map((v, i) => {
      const angle = (360 / n) * i;
      const radius = (v / MAX_VALUE) * r;
      const p = polarToCartesian(cx, cy, radius, angle);
      return `${p.x},${p.y}`;
    })
    .join(" ");
}

function RadarChart({
  competencias,
}: {
  competencias: CompetenciaPerfil[];
}) {
  const labels = competencias.map((c) => c.nombre);
  const valuesEntrada = competencias.map((c) => c.valueEntrada);
  const valuesSalida = competencias.map((c) => c.valueSalida);
  const n = labels.length;
  const gridLevels = [1, 2, 3];

  return (
    <svg
      viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`}
      className="w-full max-w-[320px] h-auto mx-auto"
      aria-label="Gráfico radar de competencias SPC"
    >
      {/* Grid */}
      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={radarPolygonPoints(
            Array(n).fill(level),
            RADAR_CX,
            RADAR_CY,
            RADAR_R
          )}
          fill="none"
          stroke="var(--line)"
          strokeWidth="1"
        />
      ))}
      {/* Axes */}
      {labels.map((_, i) => {
        const angle = (360 / n) * i - 90;
        const end = polarToCartesian(RADAR_CX, RADAR_CY, RADAR_R, angle + 90);
        return (
          <line
            key={i}
            x1={RADAR_CX}
            y1={RADAR_CY}
            x2={end.x}
            y2={end.y}
            stroke="var(--line)"
            strokeWidth="1"
          />
        );
      })}
      {/* Labels */}
      {labels.map((label, i) => {
        const angle = (360 / n) * i;
        const labelR = RADAR_R + 18;
        const p = polarToCartesian(RADAR_CX, RADAR_CY, labelR, angle + 90);
        const short =
          label.length > 18 ? label.slice(0, 16) + "…" : label;
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-[var(--ink)] text-[10px] font-medium"
          >
            {short}
          </text>
        );
      })}
      {/* Serie: al entrar (diagnóstico) */}
      <polygon
        points={radarPolygonPoints(valuesEntrada, RADAR_CX, RADAR_CY, RADAR_R)}
        fill="var(--primary-soft)"
        stroke="var(--primary)"
        strokeWidth="2"
        fillOpacity="0.5"
      />
      {/* Serie: al salir (evaluación final) */}
      <polygon
        points={radarPolygonPoints(valuesSalida, RADAR_CX, RADAR_CY, RADAR_R)}
        fill="var(--accent-soft)"
        stroke="var(--accent)"
        strokeWidth="2"
        fillOpacity="0.6"
      />
    </svg>
  );
}

export default function PerfilCompetenciasPage() {
  const [competencias, setCompetencias] = useState<CompetenciaPerfil[]>([]);
  const [courseName, setCourseName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile/competencias", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        if (Array.isArray(data.competencias)) setCompetencias(data.competencias);
        if (data.courseName) setCourseName(data.courseName);
      })
      .catch(() => setError("Error al cargar competencias"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl">
        <p className="text-[var(--text-muted)]">Cargando competencias…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/perfil"
          className="text-[var(--ink-muted)] hover:text-[var(--ink)] text-sm font-medium no-underline"
        >
          ← Mi perfil
        </Link>
      </div>
      <h1 className="heading-hero text-[var(--ink)]">Competencias SPC</h1>
      <p className="text-[var(--text-muted)] text-sm">
        Comparativo de competencias del Servicio Profesional de Carrera: nivel al
        entrar (diagnóstico) y nivel al salir (desarrolladas en el programa).
        {courseName && (
          <span className="block mt-1">Programa: {courseName}</span>
        )}
      </p>

      {error && !error.includes("FIREBASE_SERVICE_ACCOUNT") && (
        <div
          className="p-4 rounded-xl border border-[var(--coral)] bg-[var(--coral-soft)] text-[var(--coral)]"
          role="alert"
        >
          {error}
        </div>
      )}

      {competencias.length === 0 && !error && (
        <div className="card-premium p-6 text-center text-[var(--text-muted)]">
          No hay datos de competencias para mostrar. Completa lecciones del
          programa para que se reflejen aquí.
        </div>
      )}

      {competencias.length > 0 && (
        <>
          <div className="card-premium p-6">
            <p className="section-label mb-2">Visualización</p>
            <h2 className="heading-section mb-4">Radar de competencias</h2>
            <div className="flex justify-center mb-4">
              <RadarChart competencias={competencias} />
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <span className="flex items-center gap-2">
                <span
                  className="inline-block w-4 h-4 rounded border-2 border-[var(--primary)] bg-[var(--primary-soft)]"
                  aria-hidden
                />
                Nivel al entrar (diagnóstico)
              </span>
              <span className="flex items-center gap-2">
                <span
                  className="inline-block w-4 h-4 rounded border-2 border-[var(--accent)] bg-[var(--accent-soft)]"
                  aria-hidden
                />
                Nivel al salir (programa)
              </span>
            </div>
          </div>

          <div className="card-premium p-6">
            <p className="section-label mb-2">Detalle</p>
            <h2 className="heading-section mb-4">Por competencia</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-[var(--line)]">
                    <th className="py-2 pr-4 font-semibold text-[var(--ink)]">
                      Competencia
                    </th>
                    <th className="py-2 pr-4 font-semibold text-[var(--ink)]">
                      Al entrar
                    </th>
                    <th className="py-2 font-semibold text-[var(--ink)]">
                      Al salir
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {competencias.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-[var(--line-subtle)]"
                    >
                      <td className="py-2 pr-4 text-[var(--ink)]">{c.nombre}</td>
                      <td className="py-2 pr-4 capitalize text-[var(--muted)]">
                        {c.nivelEntrada}
                      </td>
                      <td className="py-2 capitalize text-[var(--ink)]">
                        {c.nivelSalida}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-[var(--text-muted)]">
              Referencia: Acuerdo SFP DOF 2025 · Servicio Profesional de Carrera
              (México).
            </p>
          </div>
        </>
      )}
    </div>
  );
}
