"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const FRASES = [
  "Los grandes cambios en el gobierno los hacen personas comunes con ideas extraordinarias.",
  "La innovación pública no es un lujo — es una responsabilidad.",
  "Cada trámite simplificado es tiempo devuelto a un ciudadano.",
  "El mejor momento para modernizar fue ayer. El segundo mejor es hoy.",
  "Gobernar bien es escuchar, aprender y actuar.",
  "La transformación digital empieza con una persona que decide hacerlo diferente.",
  "Tu institución cambia cuando tú cambias primero.",
];

const TAREAS = [
  { id: 1, t: "Reflexión módulo 1", urgente: true },
  { id: 2, t: "Quiz módulo 2", urgente: false },
  { id: 3, t: "Carta al yo futuro", urgente: false },
];
const BADGES = [
  { id: 1, n: "Primera lección", on: true },
  { id: 2, n: "Quiz perfecto", on: true },
  { id: 3, n: "7 días racha", on: false },
  { id: 4, n: "Certificado", on: false },
];
const OB = [
  { id: "a", l: "Perfil", done: true },
  { id: "b", l: "Diagnóstico", done: true },
  { id: "c", l: "1ª lección", done: false, act: true },
  { id: "d", l: "Recordatorios", done: false },
  { id: "e", l: "Comunidad", done: false },
];

const STATS = [
  { icon: "📚", value: "5/12", label: "Lecciones" },
  { icon: "⏱", value: "18h", label: "Aprendizaje" },
  { icon: "⭐", value: "8.7", label: "Calificación" },
  { icon: "🔥", value: "7 días", label: "Racha" },
];

export default function InicioPage() {
  const [ck, setCk] = useState(false);
  const [mood, setMood] = useState<string | null>(null);
  const [obH, setObH] = useState(false);
  const [saludo, setSaludo] = useState("Bienvenido");
  const [frase, setFrase] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const d = new Date().toISOString().split("T")[0];
    if (localStorage.getItem("ck_" + d)) setCk(true);
    if (localStorage.getItem("ob_hidden")) setObH(true);
  }, []);

  useEffect(() => {
    const h = new Date().getHours();
    setSaludo(h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches");
    setFrase(FRASES[new Date().getDay()] ?? FRASES[0]!);
  }, []);

  const doCheckin = (v: string) => {
    setMood(v);
    setCk(true);
    if (typeof window !== "undefined") {
      const d = new Date().toISOString().split("T")[0];
      localStorage.setItem("ck_" + d, v);
    }
  };

  const hideOnboarding = () => {
    setObH(true);
    if (typeof window !== "undefined") localStorage.setItem("ob_hidden", "1");
  };

  const prog = 30;
  const r = 24;

  return (
    <div className="min-h-screen bg-[var(--neu-bg)] font-[var(--font)] p-5 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6 lg:gap-8 items-start">

        {/* ══ COLUMNA PRINCIPAL ══ */}
        <div className="flex flex-col gap-6">

          {/* 1 · Bienvenida + check-in */}
          <section
            className="rounded-2xl p-6 sm:p-7 bg-[var(--neu-bg)] transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)]"
            style={{ boxShadow: "var(--neu-shadow-out-sm)" }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#9ca3af] tracking-wider uppercase mb-1">{saludo}</p>
                <h1 className="text-xl sm:text-2xl font-bold text-[var(--azul-dark)] mb-1 leading-tight">
                  Hola, María 👋
                </h1>
                <p className="text-sm text-[#6b7280] leading-relaxed max-w-md">
                  {ck && mood ? (
                    <>
                      {mood === "bien" && "Con energía hoy. "}
                      {mood === "regular" && "Un paso pequeño cuenta. "}
                      {mood === "dificil" && "Los días difíciles también suman. "}
                      <span className="text-[var(--azul)]">{frase}</span>
                    </>
                  ) : (
                    frase
                  )}
                </p>
              </div>
              {!ck ? (
                <div className="flex flex-col items-stretch sm:items-end gap-2 flex-shrink-0">
                  <p className="text-[10px] text-[#9ca3af]">¿Cómo llegaste hoy?</p>
                  <div className="flex gap-2">
                    {([
                      ["bien", "#00e5a0", "Bien"],
                      ["regular", "#f59e0b", "Regular"],
                      ["dificil", "#ef4444", "Difícil"],
                    ] as [string, string, string][]).map(([v, c, l]) => (
                      <button
                        key={v}
                        onClick={() => doCheckin(v)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[var(--neu-bg)] border-0 cursor-pointer text-xs font-medium text-[#374151] transition-all duration-150 hover:shadow-[var(--neu-shadow-out-sm)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--azul)]"
                        style={{ boxShadow: "var(--neu-shadow-in-sm)" }}
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c }} />
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  className="rounded-xl py-3 px-5 text-center flex-shrink-0 bg-[var(--azul)]"
                  style={{ boxShadow: "4px 4px 12px rgba(20,40,212,0.25)" }}
                >
                  <p className="text-2xl font-bold text-white leading-none">{prog}%</p>
                  <p className="text-[9px] text-white/60 uppercase tracking-widest mt-1">Completado</p>
                </div>
              )}
            </div>
          </section>

          {/* 2 · Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {STATS.map((s, i) => (
              <div
                key={i}
                className="rounded-xl p-4 sm:p-5 text-center bg-[var(--neu-bg)] transition-shadow duration-200 hover:shadow-[var(--neu-shadow-out)]"
                style={{ boxShadow: "var(--neu-shadow-out-sm)" }}
              >
                <p className="text-base sm:text-lg mb-1">{s.icon}</p>
                <p className="text-lg font-bold text-[var(--azul)] leading-none mb-0.5">{s.value}</p>
                <p className="text-[10px] text-[#9ca3af] uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>

          {/* 3 · CTA Siguiente paso */}
          <div
            className="rounded-2xl p-5 sm:p-6 flex flex-wrap items-center gap-4 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, var(--azul) 0%, var(--azul-bright) 100%)",
              boxShadow: "8px 8px 20px rgba(20,40,212,0.25)",
            }}
          >
            <div
              className="absolute top-0 right-0 bottom-0 w-2/5 bg-[radial-gradient(circle_at_80%_50%,rgba(255,255,255,0.08)_0%,transparent_60%)]"
              aria-hidden
            />
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0 text-xl">
              📖
            </div>
            <div className="flex-1 min-w-0 z-10">
              <p className="text-[9px] font-bold tracking-[0.16em] uppercase text-white/60 mb-1">Siguiente paso</p>
              <p className="text-base font-bold text-white mb-0.5">Co-diseño ciudadano</p>
              <p className="text-xs text-white/75">Módulo 2 · ~12 min · Quiz al final</p>
            </div>
            <Link
              href="/curso"
              className="shrink-0 rounded-full px-5 py-2.5 bg-white text-[var(--azul)] text-sm font-bold no-underline z-10 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}
            >
              Continuar →
            </Link>
          </div>

          {/* 4 · Tareas + Logros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            <section
              className="rounded-2xl p-5 bg-[var(--neu-bg)] transition-shadow duration-200 hover:shadow-[var(--neu-shadow-out)]"
              style={{ boxShadow: "var(--neu-shadow-out-sm)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-[var(--azul-dark)] uppercase tracking-wide">Tareas pendientes</h2>
                <span className="text-[10px] font-semibold bg-[var(--azul)] text-white rounded-full px-2 py-0.5">3</span>
              </div>
              <ul className="space-y-0">
                {TAREAS.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center gap-3 py-2.5 border-b border-[rgba(174,183,194,0.25)] last:border-0"
                  >
                    <div
                      className="w-4 h-4 rounded-md shrink-0 bg-[var(--neu-bg)]"
                      style={{ boxShadow: "var(--neu-shadow-in-sm)" }}
                    />
                    <span className="flex-1 text-sm text-[#374151]">{t.t}</span>
                    {t.urgente && (
                      <span className="text-[9px] font-bold bg-red-500/10 text-red-600 rounded-md px-1.5 py-0.5 shrink-0">
                        Hoy
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <Link href="/tareas" className="inline-block mt-3 text-xs font-medium text-[var(--azul)] no-underline hover:underline">
                Ver todas →
              </Link>
            </section>

            <section
              className="rounded-2xl p-5 bg-[var(--neu-bg)] transition-shadow duration-200 hover:shadow-[var(--neu-shadow-out)]"
              style={{ boxShadow: "var(--neu-shadow-out-sm)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-[var(--azul-dark)] uppercase tracking-wide">Mis logros</h2>
                <span className="text-xs text-[#9ca3af]">2/4</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {BADGES.map((b) => (
                  <span
                    key={b.id}
                    className="text-xs font-medium py-1.5 px-3 rounded-full"
                    style={{
                      background: b.on ? "rgba(0,229,160,0.12)" : "var(--neu-bg)",
                      color: b.on ? "var(--acento-dark)" : "#9ca3af",
                      boxShadow: b.on ? undefined : "var(--neu-shadow-in-sm)",
                    }}
                  >
                    {b.n}
                  </span>
                ))}
              </div>
              <Link href="/perfil" className="inline-block mt-3 text-xs font-medium text-[var(--azul)] no-underline hover:underline">
                Ver todos →
              </Link>
            </section>
          </div>

          {/* 5 · Onboarding */}
          {!obH && (
            <section
              className="rounded-2xl p-4 sm:p-5 bg-[var(--neu-bg)]"
              style={{ boxShadow: "var(--neu-shadow-out-sm)" }}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xs font-bold text-[var(--azul-dark)]">Primeros pasos — 2 de 5</h2>
                <button
                  type="button"
                  onClick={hideOnboarding}
                  className="text-xs text-[#9ca3af] bg-transparent border-0 cursor-pointer hover:text-[#6b7280] focus:outline-none"
                >
                  Ocultar
                </button>
              </div>
              <div className="flex gap-1.5 mb-3">
                {OB.map((s) => (
                  <div
                    key={s.id}
                    className="flex-1 py-2 px-1 rounded-lg text-center bg-[var(--neu-bg)]"
                    style={{
                      border: s.done ? "1px solid rgba(0,229,160,0.5)" : s.act ? "1px solid var(--azul)" : "1px solid rgba(174,183,194,0.3)",
                      boxShadow: s.done || s.act ? undefined : "var(--neu-shadow-in-sm)",
                    }}
                  >
                    <p
                      className="text-[9px] font-semibold leading-tight"
                      style={{ color: s.done ? "var(--acento-dark)" : s.act ? "var(--azul)" : "#9ca3af" }}
                    >
                      {s.l}
                    </p>
                  </div>
                ))}
              </div>
              <div
                className="h-1 rounded-full overflow-hidden bg-[var(--neu-bg)]"
                style={{ boxShadow: "var(--neu-shadow-in-sm)" }}
              >
                <div
                  className="h-full w-2/5 rounded-full"
                  style={{ background: "linear-gradient(90deg, var(--azul), var(--azul-bright))" }}
                />
              </div>
            </section>
          )}
        </div>

        {/* ══ COLUMNA DERECHA ══ */}
        <aside className="flex flex-col gap-4">
          <section
            className="rounded-2xl p-5 bg-[var(--neu-bg)] transition-shadow duration-200 hover:shadow-[var(--neu-shadow-out)]"
            style={{ boxShadow: "var(--neu-shadow-out-sm)" }}
          >
            <h2 className="text-xs font-bold text-[var(--azul-dark)] mb-4 uppercase tracking-wide">Tu progreso</h2>
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 shrink-0">
                <svg width="56" height="56" className="absolute inset-0 -rotate-90" aria-hidden>
                  <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(174,183,194,0.35)" strokeWidth="4" />
                  <circle
                    cx="28"
                    cy="28"
                    r={r}
                    fill="none"
                    stroke="var(--azul)"
                    strokeWidth="4"
                    strokeDasharray={2 * Math.PI * r}
                    strokeDashoffset={2 * Math.PI * r * (1 - prog / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[var(--azul)]">
                  {prog}%
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--azul-dark)] mb-0.5">{prog}% listo</p>
                <p className="text-xs text-[#9ca3af]">Módulo 2 activo</p>
                <p className="text-xs text-[#9ca3af]">5 de 12 lecciones</p>
              </div>
            </div>
            <div
              className="mt-4 h-1.5 rounded-full overflow-hidden bg-[var(--neu-bg)]"
              style={{ boxShadow: "var(--neu-shadow-in-sm)" }}
            >
              <div
                className="h-full rounded-full transition-[width] duration-300"
                style={{
                  width: `${prog}%`,
                  background: "linear-gradient(90deg, var(--azul), var(--azul-bright))",
                  boxShadow: "0 0 8px rgba(20,40,212,0.35)",
                }}
              />
            </div>
          </section>

          <section
            className="rounded-2xl p-5 text-white"
            style={{
              background: "linear-gradient(135deg, var(--azul), var(--azul-bright))",
              boxShadow: "6px 6px 16px rgba(20,40,212,0.2)",
            }}
          >
            <p className="text-[9px] font-bold tracking-widest uppercase text-white/55 mb-1.5">Misión de hoy</p>
            <p className="text-xs text-white/90 leading-relaxed mb-3">
              Completa la lección de co-diseño y escribe tu reflexión.
            </p>
            <div className="h-1 rounded-full overflow-hidden bg-white/15">
              <div className="h-full w-3/5 rounded-full bg-[var(--acento)]" />
            </div>
            <p className="text-[9px] text-white/50 mt-1">60% completada</p>
          </section>

          <section
            className="rounded-2xl p-5 bg-[var(--neu-bg)] transition-shadow duration-200 hover:shadow-[var(--neu-shadow-out)]"
            style={{ boxShadow: "var(--neu-shadow-out-sm)" }}
          >
            <h2 className="text-xs font-bold text-[var(--azul-dark)] mb-2 uppercase tracking-wide">Comunidad</h2>
            <p className="text-xs text-[#9ca3af] mb-3 leading-relaxed">Sé el primero en publicar algo hoy.</p>
            <Link
              href="/comunidad"
              className="block text-center text-xs font-semibold text-[var(--azul)] py-2.5 px-4 rounded-xl no-underline transition-shadow hover:shadow-[var(--neu-shadow-out-sm)]"
              style={{ background: "var(--neu-bg)", boxShadow: "var(--neu-shadow-in-sm)" }}
            >
              Crear post
            </Link>
          </section>

          <section
            className="rounded-2xl p-5 bg-[var(--neu-bg)] transition-shadow duration-200 hover:shadow-[var(--neu-shadow-out)]"
            style={{ boxShadow: "var(--neu-shadow-out-sm)" }}
          >
            <h2 className="text-xs font-bold text-[var(--azul-dark)] mb-2 uppercase tracking-wide">Próxima sesión</h2>
            <p className="text-xs text-[#9ca3af] mb-3 leading-relaxed">Sin sesiones programadas.</p>
            <Link
              href="/sesiones"
              className="block text-center text-xs text-[#6b7280] py-2.5 px-4 rounded-xl no-underline bg-[var(--neu-bg)]"
              style={{ boxShadow: "var(--neu-shadow-in-sm)" }}
            >
              Ver sesiones
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
