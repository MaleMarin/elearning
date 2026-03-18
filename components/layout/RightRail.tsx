"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const CARD_STYLE: React.CSSProperties = {
  background: "#e8eaf0",
  borderRadius: 18,
  padding: "16px 14px",
  boxShadow: "5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff",
};

interface DashboardData {
  userName: string;
  progress?: { lessonsDone: number; lessonsTotal: number };
}

interface ProgressData {
  streakDays: number;
  logros: { id: string; earned: boolean }[];
}

const LOGROS_CONFIG: { id: string; label: string; icon: string }[] = [
  { id: "cifrado", label: "CIFRADO", icon: "lock" },
  { id: "defensor", label: "DEFENSOR", icon: "shield" },
  { id: "top10", label: "TOP 10%", icon: "trophy" },
  { id: "experto", label: "EXPERTO", icon: "star" },
  { id: "redgov", label: "RED GOV", icon: "users" },
  { id: "graduado", label: "GRADUADO", icon: "graduation" },
];

function LogroIcon({ name }: { name: string }) {
  const size = 20;
  if (name === "lock")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    );
  if (name === "shield")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  if (name === "trophy")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 21h8M12 17v4M7 4h10M6 4v2a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V4" />
        <path d="M6 8v2a6 6 0 0 0 6 6h0a6 6 0 0 0 6-6V8" />
        <path d="M6 14h12" />
      </svg>
    );
  if (name === "star")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    );
  if (name === "users")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  if (name === "graduation")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    );
  return null;
}

/**
 * Panel derecho en /inicio: Perfil, Mis notas, Mis logros, Calendario.
 */
export function RightRail() {
  const pathname = usePathname();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [nota, setNota] = useState("");
  const [notaLoading, setNotaLoading] = useState(false);
  const [notaSaved, setNotaSaved] = useState(false);

  const progresoPct = dashboard?.progress && dashboard.progress.lessonsTotal > 0
    ? Math.round((dashboard.progress.lessonsDone / dashboard.progress.lessonsTotal) * 100)
    : 0;
  const logrosEarned = progress?.logros?.filter((l) => l.earned).length ?? 0;
  const streakDays = progress?.streakDays ?? 0;
  const userName = dashboard?.userName ?? "Estudiante";
  const initials = userName
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "E";

  useEffect(() => {
    fetch("/api/dashboard", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && !("error" in d)) setDashboard({ userName: d.userName ?? "Estudiante", progress: d.progress });
      })
      .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    fetch("/api/profile/progress", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && Array.isArray(d.logros)) setProgress({ streakDays: d.streakDays ?? 0, logros: d.logros });
      })
      .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    fetch("/api/notas/inicio", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const text = (d && typeof (d as { text?: string }).text === "string") ? (d as { text: string }).text : "";
        setNota(text);
      })
      .catch(() => {});
  }, []);

  const handleGuardarNota = () => {
    setNotaLoading(true);
    setNotaSaved(false);
    fetch("/api/notas/inicio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: nota }),
      credentials: "include",
    })
      .then((r) => r.ok)
      .then((ok) => { if (ok) setNotaSaved(true); })
      .finally(() => setNotaLoading(false));
  };

  const calYear = 2026;
  const calMonth = 3;
  const calFirstDay = new Date(calYear, calMonth - 1, 1).getDay();
  const calDaysInMonth = new Date(calYear, calMonth, 0).getDate();
  const calToday = 17;
  const weekDays = ["L", "M", "X", "J", "V", "S", "D"];
  const activityDays = new Set([3, 10, 17, 24]);

  const containerStyle: React.CSSProperties = {
    width: 300,
    minWidth: 300,
    background: "#e8eaf0",
    boxShadow: "-4px 0 14px #c2c8d6",
    padding: "16px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    overflowY: "auto",
  };

  return (
    <aside
      className="hidden xl:flex min-h-screen flex-col flex-shrink-0"
      style={containerStyle}
      aria-label="Panel derecho"
    >
      {/* CARD 1 — PERFIL DEL ALUMNO */}
      <section style={CARD_STYLE} aria-labelledby="rail-perfil-heading">
        <h2 id="rail-perfil-heading" className="sr-only">Perfil del alumno</h2>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1428d4, #2b4fff)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Space Mono', monospace",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            {initials}
          </div>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 14, color: "#0a0f8a", margin: 0 }}>
            {userName}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              width: "100%",
              marginTop: 4,
            }}
          >
            {[
              { label: "PROGRESO", value: `${progresoPct}%` },
              { label: "LOGROS", value: String(logrosEarned) },
              { label: "CALIFIC.", value: "8.7" },
              { label: "RACHA", value: `${streakDays}d` },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#8892b0", margin: 0, textTransform: "uppercase" }}>
                  {label}
                </p>
                <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, fontWeight: 700, color: "#0a0f8a", margin: "2px 0 0 0" }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CARD 2 — MIS NOTAS */}
      <section style={CARD_STYLE} aria-labelledby="rail-notas-heading">
        <h2 id="rail-notas-heading" style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: "#0a0f8a", margin: "0 0 4px 0", textTransform: "uppercase" }}>
          Mis notas
        </h2>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#8892b0", margin: "0 0 8px 0" }}>
          Solo tú puedes ver tus notas
        </p>
        <textarea
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="Escribe tu nota..."
          rows={4}
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: "#e8eaf0",
            border: "none",
            borderRadius: 12,
            padding: 10,
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "#0a0f8a",
            boxShadow: "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff",
            resize: "vertical",
          }}
        />
        <button
          type="button"
          onClick={handleGuardarNota}
          disabled={notaLoading}
          style={{
            marginTop: 8,
            width: "100%",
            padding: "10px 14px",
            fontFamily: "var(--font-heading)",
            fontSize: 12,
            fontWeight: 700,
            color: "#0a0f8a",
            background: "linear-gradient(135deg, #00e5a0, #00c98a)",
            border: "none",
            borderRadius: 50,
            boxShadow: "4px 4px 12px rgba(0,229,160,0.4), -3px -3px 8px #ffffff",
            cursor: notaLoading ? "wait" : "pointer",
          }}
        >
          {notaLoading ? "Guardando…" : notaSaved ? "Guardado" : "Guardar nota"}
        </button>
      </section>

      {/* CARD 3 — MIS LOGROS */}
      <section style={CARD_STYLE} aria-labelledby="rail-logros-heading">
        <h2 id="rail-logros-heading" style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: "#0a0f8a", margin: "0 0 10px 0", textTransform: "uppercase" }}>
          Mis logros
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {LOGROS_CONFIG.map((item, index) => {
            const obtained = index < Math.min(logrosEarned, LOGROS_CONFIG.length);
            const { label, icon } = item;
            return (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  padding: 8,
                  borderRadius: 12,
                  background: obtained ? "#e8eaf0" : "#e8eaf0",
                  boxShadow: obtained
                    ? "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff"
                    : "inset 2px 2px 6px #c2c8d6, inset -2px -2px 6px #ffffff",
                  opacity: obtained ? 1 : 0.4,
                }}
              >
                <span style={{ color: obtained ? "#00b87d" : "#8892b0" }}>
                  <LogroIcon name={icon} />
                </span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, fontWeight: 700, color: obtained ? "#0a0f8a" : "#8892b0", textAlign: "center" }}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* CARD 4 — CALENDARIO */}
      <section style={CARD_STYLE} aria-labelledby="rail-cal-heading">
        <h2 id="rail-cal-heading" style={{ fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 700, color: "#0a0f8a", margin: "0 0 10px 0" }}>
          Marzo de 2026
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, textAlign: "center" }}>
          {weekDays.map((d) => (
            <span key={d} style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#8892b0", fontWeight: 700 }}>
              {d}
            </span>
          ))}
          {Array.from({ length: calFirstDay }, (_, i) => (
            <span key={`pad-${i}`} />
          ))}
          {Array.from({ length: calDaysInMonth }, (_, i) => {
            const day = i + 1;
            const isToday = day === calToday;
            const hasActivity = activityDays.has(day);
            return (
              <div key={day} style={{ position: "relative" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 28,
                    height: 28,
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 12,
                    color: isToday ? "#fff" : "#0a0f8a",
                    background: isToday ? "#1428d4" : "transparent",
                    borderRadius: "50%",
                    fontWeight: isToday ? 700 : 400,
                  }}
                >
                  {day}
                </span>
                {hasActivity && !isToday && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: -2,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "#00e5a0",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>
    </aside>
  );
}
