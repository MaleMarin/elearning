"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const BG = "#e8eaf0";
const CARD_SHADOW = "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff";
const CARD_SHADOW_HOVER = "8px 8px 18px #c2c8d6, -8px -8px 18px #ffffff";

type PendienteItem = { id: string; title: string; sub?: string; href: string };

export default function PendientesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<PendienteItem[]>([]);
  const [tareas, setTareas] = useState<PendienteItem[]>([]);
  const [sesiones, setSesiones] = useState<PendienteItem[]>([]);
  const [logros, setLogros] = useState<PendienteItem[]>([]);
  const [modulos, setModulos] = useState<PendienteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard", { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/curso", { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([dashboard, curso]) => {
        if (curso?.modules) {
          const sinEmpezar = (curso.modules as { id: string; title: string; lessons?: unknown[] }[])
            .filter((m) => !m.lessons?.length || true)
            .slice(0, 5)
            .map((m) => ({ id: m.id, title: m.title, sub: "Módulo", href: "/curso" }));
          setModulos(sinEmpezar.length ? sinEmpezar : [{ id: "1", title: "Módulo 3 · Ciberseguridad", sub: "Siguiente sin empezar", href: "/curso" }]);
        } else {
          setModulos([{ id: "1", title: "Módulo 3 · Ciberseguridad", sub: "Siguiente sin empezar", href: "/curso" }]);
        }
        setQuizzes([{ id: "q1", title: "Quiz Módulo 3", sub: "Disponible hasta hoy 16:00", href: "/curso#quiz" }]);
        setTareas([{ id: "t1", title: "Entrega · Actividad práctica", sub: "Vence el 18 Mar", href: "/curso#tareas" }]);
        setSesiones([{ id: "s1", title: "Sesión en vivo", sub: "Mañana 10:00 AM", href: "/sesiones-en-vivo" }]);
        setLogros([{ id: "l1", title: "Experto", sub: "Completa 1 lección más", href: "/mi-perfil#logros" }]);
      })
      .catch(() => {
        setQuizzes([{ id: "q1", title: "Quiz Módulo 3", sub: "Disponible hasta hoy 16:00", href: "/curso#quiz" }]);
        setTareas([{ id: "t1", title: "Entrega · Actividad práctica", sub: "Vence el 18 Mar", href: "/curso#tareas" }]);
        setSesiones([{ id: "s1", title: "Sesión en vivo", sub: "Mañana 10:00 AM", href: "/sesiones-en-vivo" }]);
        setLogros([{ id: "l1", title: "Experto", sub: "Completa 1 lección más", href: "/mi-perfil#logros" }]);
        setModulos([{ id: "1", title: "Módulo 3 · Ciberseguridad", sub: "Siguiente sin empezar", href: "/curso" }]);
      })
      .finally(() => setLoading(false));
  }, []);

  const Section = ({
    title,
    items,
    icon,
    emptyMsg,
  }: {
    title: string;
    items: PendienteItem[];
    icon: string;
    emptyMsg: string;
  }) => (
    <section style={{ background: BG, borderRadius: 18, padding: 20, boxShadow: CARD_SHADOW, marginBottom: 16 }}>
      <h3 style={{ fontSize: 12, fontWeight: 700, color: "#8892b0", textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: "'Space Mono', monospace", marginBottom: 14 }}>
        {title}
      </h3>
      {items.length === 0 ? (
        <p style={{ fontSize: 13, color: "#8892b0" }}>{emptyMsg}</p>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => router.push(item.href)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push(item.href); } }}
            style={{
              cursor: "pointer",
              padding: "12px 14px",
              borderRadius: 14,
              background: BG,
              boxShadow: "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 12,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = CARD_SHADOW_HOVER; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff"; }}
          >
            <span style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, background: "rgba(20,40,212,0.1)", boxShadow: "inset 2px 2px 5px #c2c8d6" }}>{icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#0a0f8a", marginBottom: 2 }}>{item.title}</p>
              {item.sub && <p style={{ fontSize: 12, color: "#8892b0", fontFamily: "'Space Mono', monospace" }}>{item.sub}</p>}
            </div>
            <span style={{ fontSize: 12, color: "#1428d4", fontWeight: 600 }}>Ir →</span>
          </div>
        ))
      )}
    </section>
  );

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "var(--font-heading)", padding: "24px 16px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <Link href="/inicio" style={{ fontSize: 13, color: "#8892b0", marginBottom: 12, display: "inline-block" }}>← Volver al inicio</Link>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0a0f8a", letterSpacing: "-0.5px", marginBottom: 4 }}>
          Mis pendientes
        </h1>
        <p style={{ fontSize: 14, color: "#8892b0", marginBottom: 24 }}>Todo lo que tienes por hacer</p>

        {loading ? (
          <p style={{ color: "#8892b0", fontSize: 13 }}>Cargando…</p>
        ) : (
          <>
            <Section title="Quizzes sin completar" items={quizzes} icon="📋" emptyMsg="No hay quizzes pendientes." />
            <Section title="Tareas con fecha límite" items={tareas} icon="📝" emptyMsg="No hay tareas pendientes." />
            <Section title="Sesiones próximas" items={sesiones} icon="🎙️" emptyMsg="No hay sesiones programadas." />
            <Section title="Logros a punto de desbloquear" items={logros} icon="⭐" emptyMsg="Sigue avanzando para desbloquear logros." />
            <Section title="Módulos sin empezar" items={modulos} icon="📚" emptyMsg="No hay módulos pendientes." />
          </>
        )}
      </div>
    </div>
  );
}
