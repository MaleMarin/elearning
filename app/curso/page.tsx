"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { CursoApiResponse } from "@/app/api/curso/route";
import type { ProgramaApiResponse } from "@/app/api/curso/programa/route";
import { ModuleProgramView } from "@/components/modules";
import { getDemoMode } from "@/lib/env";

type CursoView = "modulos" | "programa";

export default function CursoPage() {
  const router = useRouter();
  const [data, setData] = useState<CursoApiResponse | null>(null);
  const [programaData, setProgramaData] = useState<ProgramaApiResponse | null>(null);
  const [programaLoading, setProgramaLoading] = useState(false);
  const [view, setView] = useState<CursoView>("modulos");
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/curso")
      .then((r) => r.json())
      .then((d: CursoApiResponse) => {
        if (d && !("error" in d)) setData(d);
        else setData(null);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!data?.course?.id) return;
    fetch(`/api/progress?courseId=${encodeURIComponent(data.course.id)}`)
      .then((r) => r.json())
      .then((d: { completedLessonIds?: string[] }) => {
        if (d && Array.isArray(d.completedLessonIds)) setCompletedLessonIds(d.completedLessonIds);
      })
      .catch(() => {});
  }, [data?.course?.id]);

  useEffect(() => {
    if (view !== "programa") return;
    setProgramaLoading(true);
    fetch("/api/curso/programa", { credentials: "include" })
      .then((r) => r.json())
      .then((d: ProgramaApiResponse & { error?: string }) => {
        if (d && !("error" in d)) setProgramaData(d);
        else setProgramaData(null);
      })
      .catch(() => setProgramaData(null))
      .finally(() => setProgramaLoading(false));
  }, [view]);

  useEffect(() => {
    if (getDemoMode() || !data?.course?.id) return;
    fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        action: "course_view",
        resourceId: data.course.id,
        resourceName: data.course.title ?? "",
      }),
    }).catch(() => {});
  }, [data?.course?.id, data?.course?.title]);

  if (loading) {
    return (
      <div style={{ flex: 1, padding: "20px 20px", background: "#e8eaf0", minHeight: "100vh", fontFamily: "'Syne', sans-serif" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", letterSpacing: "-0.5px" }}>Mi curso</h1>
          <p style={{ fontSize: 13, color: "#8892b0", marginTop: 4 }}>Cargando…</p>
        </div>
        <div style={{ background: "#e8eaf0", borderRadius: 20, padding: 40, boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff" }}>
          <div style={{ height: 24, width: "60%", background: "#e8eaf0", borderRadius: 8, boxShadow: "inset 3px 3px 8px #c2c8d6" }} />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ flex: 1, padding: "20px 20px", background: "#e8eaf0", minHeight: "100vh", fontFamily: "'Syne', sans-serif" }}>
        <div style={{ background: "#e8eaf0", borderRadius: 20, padding: 40, textAlign: "center", maxWidth: 500, margin: "40px auto", boxShadow: "8px 8px 20px #c2c8d6, -8px -8px 20px #ffffff" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📚</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0a0f8a", marginBottom: 8 }}>Aún no tienes un curso asignado</h2>
          <p style={{ fontSize: 13, color: "#8892b0", lineHeight: 1.7, marginBottom: 24 }}>
            Pronto tendrás acceso a tu programa de formación.<br />
            El administrador te notificará cuando esté listo.
          </p>
          <a
            href="/inicio"
            style={{
              display: "inline-block",
              padding: "12px 28px",
              borderRadius: 14,
              background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
              color: "white",
              fontFamily: "'Syne', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "5px 5px 12px rgba(10,15,138,0.35)",
            }}
          >
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  if (!data.hasEnrollment) {
    router.replace("/no-inscrito");
    return null;
  }

  if (!data.course) {
    return (
      <div style={{ flex: 1, padding: "20px 20px", background: "#e8eaf0", minHeight: "100vh", fontFamily: "'Syne', sans-serif" }}>
        <div style={{ background: "#e8eaf0", borderRadius: 20, padding: 40, textAlign: "center", maxWidth: 500, margin: "40px auto", boxShadow: "8px 8px 20px #c2c8d6, -8px -8px 20px #ffffff" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📚</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0a0f8a", marginBottom: 8 }}>Aún no tienes un curso asignado</h2>
          <p style={{ fontSize: 13, color: "#8892b0", lineHeight: 1.7, marginBottom: 24 }}>
            Pronto tendrás acceso a tu programa de formación.<br />
            El administrador te notificará cuando esté listo.
          </p>
          <a
            href="/inicio"
            style={{
              display: "inline-block",
              padding: "12px 28px",
              borderRadius: 14,
              background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
              color: "white",
              fontFamily: "'Syne', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "5px 5px 12px rgba(10,15,138,0.35)",
            }}
          >
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  const hasContent = data.modules.some((m) => m.lessonCount > 0);
  if (!hasContent) {
    return (
      <div style={{ flex: 1, padding: "20px 20px", background: "#e8eaf0", minHeight: "100vh", fontFamily: "'Syne', sans-serif" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", letterSpacing: "-0.5px" }}>Mi curso</h1>
          <p style={{ fontSize: 13, color: "#8892b0", marginTop: 4 }}>{data.course.title}</p>
        </div>
        <div style={{ background: "#e8eaf0", borderRadius: 20, padding: 40, textAlign: "center", maxWidth: 500, margin: "40px auto", boxShadow: "8px 8px 20px #c2c8d6, -8px -8px 20px #ffffff" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0a0f8a", marginBottom: 8 }}>El contenido se está preparando</h2>
          <p style={{ fontSize: 13, color: "#8892b0", lineHeight: 1.7, marginBottom: 24 }}>
            Tu curso ya está asignado; los módulos y lecciones se publicarán pronto.
          </p>
          <a
            href="/inicio"
            style={{
              display: "inline-block",
              padding: "12px 28px",
              borderRadius: 14,
              background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
              color: "white",
              fontFamily: "'Syne', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "5px 5px 12px rgba(10,15,138,0.35)",
            }}
          >
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  const moduleAccess = data.moduleAccess ?? {};
  const lessonById = new Map(data.lessons.map((l) => [l.id, l]));

  return (
    <div style={{ flex: 1, padding: "20px 20px", background: "#e8eaf0", minHeight: "100vh", fontFamily: "'Syne', sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", letterSpacing: "-0.5px" }}>Mi curso</h1>
        <p style={{ fontSize: 13, color: "#8892b0", marginTop: 4 }}>{data.course.description ?? data.course.title}</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={view === "modulos"}
          onClick={() => setView("modulos")}
          style={{
            padding: "10px 18px",
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            fontFamily: "'Syne', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            background: view === "modulos" ? "#e8eaf0" : "#e8eaf0",
            color: view === "modulos" ? "#0a0f8a" : "#8892b0",
            boxShadow: view === "modulos" ? "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff" : "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
          }}
        >
          Módulos y lecciones
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "programa"}
          onClick={() => setView("programa")}
          style={{
            padding: "10px 18px",
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            fontFamily: "'Syne', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            background: "#e8eaf0",
            color: view === "programa" ? "#0a0f8a" : "#8892b0",
            boxShadow: view === "programa" ? "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff" : "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
          }}
        >
          Programa completo
        </button>
      </div>

      {view === "modulos" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {data.modules.map((mod, i) => {
            if (mod.lessonCount === 0) return null;
            const done = mod.lessons.filter((l) => completedLessonIds.includes(l.id)).length;
            const completado = mod.lessonCount ? Math.round((done / mod.lessonCount) * 100) : 0;
            const isLocked = moduleAccess[mod.id] === "locked";

            return (
              <div
                key={mod.id}
                style={{
                  background: "#e8eaf0",
                  borderRadius: 20,
                  padding: 24,
                  marginBottom: 0,
                  boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <p style={{ fontSize: 10, color: "#1428d4", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 4 }}>
                      Módulo {i + 1}
                    </p>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0a0f8a" }}>{mod.title}</h3>
                  </div>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      background: "#e8eaf0",
                      boxShadow: "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1428d4", fontFamily: "'Space Mono', monospace" }}>{completado}%</span>
                  </div>
                </div>

                {mod.lessons.map((leccion) => {
                  const completada = completedLessonIds.includes(leccion.id);
                  const meta = lessonById.get(leccion.id);
                  const duration = meta?.estimated_minutes != null && meta.estimated_minutes > 0 ? `${meta.estimated_minutes} min` : "—";

                  return (
                    <div
                      key={leccion.id}
                      role="button"
                      tabIndex={isLocked ? undefined : 0}
                      onClick={() => { if (!isLocked) router.push(`/curso/lecciones/${leccion.id}`); }}
                      onKeyDown={(e) => { if (!isLocked && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); router.push(`/curso/lecciones/${leccion.id}`); } }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 14px",
                        borderRadius: 12,
                        marginBottom: 8,
                        background: "#e8eaf0",
                        cursor: isLocked ? "default" : "pointer",
                        boxShadow: completada
                          ? "inset 2px 2px 6px #c2c8d6, inset -2px -2px 6px #ffffff"
                          : "4px 4px 9px #c2c8d6, -4px -4px 9px #ffffff",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: completada ? "rgba(0,229,160,0.2)" : "#e8eaf0",
                          boxShadow: completada ? "none" : "3px 3px 7px #c2c8d6, -3px -3px 7px #ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {completada ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00b87d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8892b0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 8 12 12 14 14" />
                          </svg>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#0a0f8a" }}>{leccion.title}</p>
                        <p style={{ fontSize: 11, color: "#8892b0", marginTop: 2 }}>{duration}</p>
                      </div>
                      {!isLocked && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8892b0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {view === "programa" && (
        <div style={{ maxWidth: 720 }}>
          {programaLoading ? (
            <div style={{ background: "#e8eaf0", borderRadius: 16, padding: 24, boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff" }}>
              <div style={{ height: 20, width: "40%", background: "#e8eaf0", borderRadius: 8, boxShadow: "inset 2px 2px 5px #c2c8d6", marginBottom: 16 }} />
              <div style={{ height: 60, background: "#e8eaf0", borderRadius: 12, boxShadow: "inset 2px 2px 5px #c2c8d6" }} />
            </div>
          ) : programaData?.modules && programaData.modules.length > 0 ? (
            <div style={{ background: "#e8eaf0", borderRadius: 20, padding: 24, boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff" }}>
              <ModuleProgramView
                modules={programaData.modules}
                onModuleClick={(id) => router.push(`/curso/modulos/${id}`)}
              />
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "#8892b0" }}>No hay módulos en el programa.</p>
          )}
        </div>
      )}
    </div>
  );
}
