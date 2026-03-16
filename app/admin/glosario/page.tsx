"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Curso {
  id: string;
  title: string;
}

interface Termino {
  id: string;
  termino: string;
  definicion: string;
  courseId?: string;
}

export default function GlosarioAdminPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cursoId, setCursoId] = useState("");
  const [terminos, setTerminos] = useState<Termino[]>([]);
  const [nuevo, setNuevo] = useState({ termino: "", definicion: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/courses", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setCursos(d.courses || []))
      .catch(() => setCursos([]));
  }, []);

  useEffect(() => {
    if (!cursoId) {
      setTerminos([]);
      return;
    }
    setLoading(true);
    fetch(`/api/admin/glosario?cursoId=${encodeURIComponent(cursoId)}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setTerminos(d.terminos || []))
      .catch(() => setTerminos([]))
      .finally(() => setLoading(false));
  }, [cursoId]);

  const handleAgregar = async () => {
    if (!nuevo.termino.trim() || !cursoId) return;
    const res = await fetch("/api/admin/glosario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ cursoId, termino: nuevo.termino.trim(), definicion: nuevo.definicion.trim() }),
    });
    const d = await res.json();
    if (d.termino) {
      setTerminos((t) => [...t, d.termino]);
      setNuevo({ termino: "", definicion: "" });
    }
  };

  const handleEliminar = async (terminoId: string) => {
    await fetch(`/api/admin/glosario/${terminoId}`, { method: "DELETE", credentials: "include" });
    setTerminos((t) => t.filter((x) => x.id !== terminoId));
  };

  return (
    <div style={{ flex: 1, padding: "18px 16px", background: "#e8eaf0", minHeight: "100vh", fontFamily: "var(--font-heading)" }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/admin" style={{ fontSize: 13, color: "#8892b0", marginBottom: 8, display: "inline-block" }}>← Admin</Link>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", letterSpacing: "-0.5px" }}>Glosario por curso</h1>
        <p style={{ fontSize: 13, color: "#8892b0", marginTop: 4 }}>Términos oficiales que el alumno ve en el glosario del curso.</p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 10, color: "#8892b0", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6, display: "block" }}>Curso</label>
        <select
          value={cursoId}
          onChange={(e) => setCursoId(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "none",
            background: "#e8eaf0",
            boxShadow: "inset 3px 3px 7px #c2c8d6, inset -3px -3px 7px #ffffff",
            fontSize: 13,
            color: "#0a0f8a",
            outline: "none",
            minWidth: 280,
          }}
        >
          <option value="">Seleccionar curso…</option>
          {cursos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {cursoId && (
        <>
          <div style={{ background: "#e8eaf0", borderRadius: 18, padding: 20, boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff", marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#0a0f8a", marginBottom: 14 }}>Agregar término</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: 12, alignItems: "end" }}>
              <input
                value={nuevo.termino}
                onChange={(e) => setNuevo((n) => ({ ...n, termino: e.target.value }))}
                placeholder="Término"
                style={{ padding: "10px 14px", borderRadius: 10, border: "none", background: "#e8eaf0", boxShadow: "inset 3px 3px 7px #c2c8d6, inset -3px -3px 7px #ffffff", fontSize: 13, color: "#0a0f8a", outline: "none" }}
              />
              <input
                value={nuevo.definicion}
                onChange={(e) => setNuevo((n) => ({ ...n, definicion: e.target.value }))}
                placeholder="Definición oficial"
                style={{ padding: "10px 14px", borderRadius: 10, border: "none", background: "#e8eaf0", boxShadow: "inset 3px 3px 7px #c2c8d6, inset -3px -3px 7px #ffffff", fontSize: 13, color: "#0a0f8a", outline: "none" }}
              />
              <button
                type="button"
                onClick={handleAgregar}
                style={{ padding: "10px 20px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "var(--font-heading)", fontSize: 12, fontWeight: 700, background: "linear-gradient(135deg, #1428d4, #0a0f8a)", color: "white", boxShadow: "4px 4px 10px rgba(10,15,138,0.3)", whiteSpace: "nowrap" }}
              >
                + Agregar
              </button>
            </div>
          </div>

          {loading ? (
            <p style={{ fontSize: 13, color: "#8892b0" }}>Cargando términos…</p>
          ) : (
            <>
              {terminos.map((t) => (
                <div
                  key={t.id}
                  style={{
                    background: "#e8eaf0",
                    borderRadius: 14,
                    padding: "12px 16px",
                    marginBottom: 8,
                    boxShadow: "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#0a0f8a" }}>{t.termino}</p>
                    <p style={{ fontSize: 12, color: "#4a5580", marginTop: 4, lineHeight: 1.5 }}>{t.definicion}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEliminar(t.id)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 8,
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "var(--font-heading)",
                      fontSize: 11,
                      fontWeight: 600,
                      background: "#e8eaf0",
                      color: "#d84040",
                      boxShadow: "3px 3px 6px #c2c8d6, -3px -3px 6px #ffffff",
                      flexShrink: 0,
                      marginLeft: 12,
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
              {terminos.length === 0 && (
                <p style={{ fontSize: 13, color: "#8892b0", textAlign: "center", padding: "30px 0" }}>No hay términos en el glosario de este curso aún.</p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
