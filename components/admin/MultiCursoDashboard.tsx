"use client";

import { useState, useEffect } from "react";

interface CursoMetrica {
  id: string;
  titulo: string;
  alumnos: number;
  completacion: number;
  activos: number;
  enRiesgo: number;
}

export default function MultiCursoDashboard() {
  const [cursos, setCursos] = useState<CursoMetrica[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/cursos/metricas", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setCursos(data.cursos ?? []);
      })
      .catch(() => setCursos([]))
      .finally(() => setLoading(false));
  }, []);

  const totales = {
    alumnos: cursos.reduce((a, c) => a + c.alumnos, 0),
    promedio: cursos.length ? Math.round(cursos.reduce((a, c) => a + c.completacion, 0) / cursos.length) : 0,
    enRiesgo: cursos.reduce((a, c) => a + c.enRiesgo, 0),
  };

  return (
    <div style={{ fontFamily: "var(--font)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { val: totales.alumnos, lbl: "Alumnos totales", color: "var(--primary)" },
          { val: `${totales.promedio}%`, lbl: "Completación promedio", color: "#00b87d" },
          { val: totales.enRiesgo, lbl: "En riesgo", color: "#d84040" },
        ].map((item, i) => (
          <div
            key={i}
            className="rounded-[14px] p-4 text-center"
            style={{
              background: "var(--neu-bg)",
              boxShadow: "var(--neu-shadow-out-sm)",
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: item.color,
                fontFamily: "var(--font-mono)",
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              {loading ? "—" : item.val}
            </div>
            <div
              className="text-[10px] uppercase tracking-wide"
              style={{ color: "var(--texto-sub)" }}
            >
              {item.lbl}
            </div>
          </div>
        ))}
      </div>

      <div
        className="rounded-[16px] overflow-hidden"
        style={{
          background: "var(--neu-bg)",
          boxShadow: "var(--neu-shadow-out-sm)",
        }}
      >
        <table className="w-full text-sm border-collapse" role="table">
          <thead>
            <tr style={{ background: "rgba(20,40,212,0.05)" }}>
              {["Curso", "Alumnos", "Completación", "Activos hoy", "En riesgo", ""].map((h) => (
                <th
                  key={h}
                  className="text-left py-2.5 px-3.5 font-bold text-[10px] uppercase tracking-wider"
                  style={{ color: "var(--ink)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-6 text-center" style={{ color: "var(--texto-sub)" }}>
                  Cargando métricas...
                </td>
              </tr>
            ) : (
              cursos.map((curso, i) => (
                <tr
                  key={curso.id}
                  className="border-t border-[var(--line-subtle)]"
                  style={{
                    background: i % 2 === 0 ? "transparent" : "rgba(20,40,212,0.02)",
                  }}
                >
                  <td className="py-2.5 px-3.5 font-semibold" style={{ color: "var(--ink)" }}>
                    {curso.titulo}
                  </td>
                  <td className="py-2.5 px-3.5 font-mono" style={{ color: "var(--texto-sub)" }}>
                    {curso.alumnos}
                  </td>
                  <td className="py-2.5 px-3.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex-1 h-1.5 rounded-sm overflow-hidden"
                        style={{
                          background: "var(--neu-bg)",
                          boxShadow: "inset 2px 2px 4px #c2c8d6, inset -2px -2px 4px #ffffff",
                        }}
                      >
                        <div
                          className="h-full rounded-sm transition-[width]"
                          style={{
                            width: `${curso.completacion}%`,
                            background: "linear-gradient(90deg, #00e5a0, #00c98a)",
                          }}
                        />
                      </div>
                      <span
                        className="text-[11px] font-mono min-w-[32px]"
                        style={{ color: "var(--texto-sub)" }}
                      >
                        {curso.completacion}%
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3.5 font-mono" style={{ color: "#00b87d" }}>
                    {curso.activos}
                  </td>
                  <td className="py-2.5 px-3.5">
                    {curso.enRiesgo > 0 ? (
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{
                          background: "rgba(216,64,64,0.1)",
                          color: "#d84040",
                        }}
                      >
                        {curso.enRiesgo} en riesgo
                      </span>
                    ) : (
                      <span style={{ color: "var(--texto-sub)" }}>—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3.5">
                    <a
                      href={`/admin/cursos/${curso.id}`}
                      className="font-semibold no-underline hover:underline"
                      style={{ color: "var(--primary)" }}
                    >
                      Ver →
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
