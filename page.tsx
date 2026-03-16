'use client'

import { useState } from 'react'

// ─── Tipos ───────────────────────────────────────────────────────────────────
type MoodValue = 1 | 2 | 3 | 4 | 5 | null
type NavKey = 'inicio' | 'curso' | 'tareas' | 'comunidad' | 'mensajes' | 'laboratorio' | 'config'

interface NavItem {
  key: NavKey
  label: string
  icon: React.ReactNode
}

interface LessonItem {
  num: number
  title: string
  duration: string
  status: 'done' | 'current' | 'locked'
}

interface LogroItem {
  icon: string
  name: string
  earned: boolean
  bg: string
}

interface ActivityItem {
  color: string
  title: string
  description: string
  time: string
}

// ─── Iconos SVG inline ────────────────────────────────────────────────────────
const IconGrid = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
)

const IconBook = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
)

const IconCheck = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
)

const IconUsers = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const IconMessage = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)

const IconLab = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

const IconSettings = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
  </svg>
)

const IconBell = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)

const IconPlay = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
)

const IconLayers = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>
)

// ─── Datos del dashboard ──────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  { key: 'inicio',      label: 'Inicio',      icon: <IconGrid /> },
  { key: 'curso',       label: 'Mi Curso',    icon: <IconBook /> },
  { key: 'tareas',      label: 'Tareas',      icon: <IconCheck /> },
  { key: 'comunidad',   label: 'Comunidad',   icon: <IconUsers /> },
  { key: 'mensajes',    label: 'Mensajes',    icon: <IconMessage /> },
  { key: 'laboratorio', label: 'Laboratorio', icon: <IconLab /> },
]

const LESSONS: LessonItem[] = [
  { num: 1, title: 'Cifrado E2E',     duration: '8 min',  status: 'done' },
  { num: 2, title: 'Autenticación',   duration: '12 min', status: 'current' },
  { num: 3, title: 'Zero Trust',      duration: '15 min', status: 'locked' },
]

const LOGROS: LogroItem[] = [
  { icon: '🔐', name: 'Cifrado',   earned: true,  bg: 'rgba(0,229,160,0.15)' },
  { icon: '🛡️', name: 'Defensor', earned: true,  bg: 'rgba(20,40,212,0.12)' },
  { icon: '⭐',  name: 'Top 10%',  earned: true,  bg: 'rgba(255,186,0,0.14)' },
  { icon: '🧠',  name: 'Experto',  earned: false, bg: 'rgba(136,146,176,0.1)' },
  { icon: '🌐',  name: 'Red Gov',  earned: false, bg: 'rgba(136,146,176,0.1)' },
  { icon: '🏆',  name: 'Graduado', earned: false, bg: 'rgba(136,146,176,0.1)' },
]

const ACTIVITY: ActivityItem[] = [
  { color: '#00e5a0', title: 'Quiz completado',       description: 'Módulo 2: 92/100 puntos',   time: 'Hace 2h' },
  { color: '#1428d4', title: 'Lección terminada',     description: 'Cifrado E2E y protocolos',  time: 'Ayer' },
  { color: '#ffc107', title: 'Logro desbloqueado',    description: 'Defensor Digital',           time: 'Lun' },
  { color: '#8892b0', title: 'Diario actualizado',    description: 'Entrada cifrada guardada',  time: 'Lun' },
]

const MOODS = ['😴', '😐', '🙂', '💪', '🔥']

// ─── Componente principal ─────────────────────────────────────────────────────
export default function DashboardAlumno() {
  const [activeNav, setActiveNav] = useState<NavKey>('inicio')
  const [selectedMood, setSelectedMood] = useState<MoodValue>(null)

  return (
    <div className="flex min-h-screen" style={{ background: '#e8eaf0', fontFamily: "var(--font-heading)" }}>

      {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
      <aside
        className="flex flex-col items-center py-6 flex-shrink-0 relative z-10"
        style={{
          width: 72,
          background: '#e8eaf0',
          boxShadow: '6px 0 20px #c2c8d6, 2px 0 6px #ffffff',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-center mb-7 flex-shrink-0"
          style={{
            width: 44, height: 44,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #1428d4, #0a0f8a)',
            boxShadow: '5px 5px 12px #c2c8d6, -3px -3px 8px #ffffff',
          }}
        >
          <IconLayers />
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-2 w-full items-center">
          {NAV_ITEMS.map((item) => (
            <NavButton
              key={item.key}
              item={item}
              active={activeNav === item.key}
              onClick={() => setActiveNav(item.key)}
            />
          ))}
        </div>

        <div className="flex-1" />

        {/* Config */}
        <NavButton
          item={{ key: 'config', label: 'Configuración', icon: <IconSettings /> }}
          active={activeNav === 'config'}
          onClick={() => setActiveNav('config')}
        />

        {/* Avatar */}
        <button
          className="flex items-center justify-center mt-2 text-white font-bold text-sm"
          style={{
            width: 40, height: 40,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #1428d4, #0a0f8a)',
            boxShadow: '4px 4px 10px #c2c8d6, -3px -3px 8px #ffffff',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "var(--font-heading)",
          }}
        >
          MA
        </button>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-5 min-w-0">

        {/* Top bar */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0a0f8a', letterSpacing: '-0.5px', lineHeight: 1 }}>
              Política Digital
            </h1>
            <p style={{ fontSize: 11, color: '#8892b0', marginTop: 3, fontFamily: "'Space Mono', monospace" }}>
              // Módulo 3 · Grupo 2026-A
            </p>
          </div>
          <button
            className="flex items-center justify-center relative"
            style={{
              width: 40, height: 40,
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              background: '#e8eaf0',
              boxShadow: '4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff',
              color: '#1428d4',
              flexShrink: 0,
            }}
          >
            <IconBell />
            <span
              className="absolute"
              style={{
                top: 8, right: 8,
                width: 7, height: 7,
                background: '#00e5a0',
                borderRadius: '50%',
                border: '2px solid #e8eaf0',
              }}
            />
          </button>
        </div>

        {/* Security strip */}
        <SecurityStrip />

        {/* Hero card */}
        <HeroCard />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <StatCard icon="📶" iconBg="rgba(0,229,160,0.14)" iconColor="#00b87d" value="12" label="Lecciones" />
          <StatCard icon="🕐" iconBg="rgba(20,40,212,0.11)" iconColor="#1428d4" value="24h" label="Tiempo" />
          <StatCard icon="⭐" iconBg="rgba(255,186,0,0.14)" iconColor="#c89000" value="5" label="Logros" />
        </div>

        {/* Check-in bienestar */}
        <CheckIn selectedMood={selectedMood} onSelect={setSelectedMood} />

        {/* Lecciones + Logros */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <LessonesPanel lessons={LESSONS} />
          <LogrosPanel logros={LOGROS} />
        </div>

        {/* Actividad reciente */}
        <ActivityPanel activity={ACTIVITY} />

        {/* CTAs */}
        <button
          className="w-full flex items-center justify-center gap-2 mb-3"
          style={{
            padding: '14px',
            borderRadius: 14,
            border: 'none',
            cursor: 'pointer',
            fontFamily: "var(--font-heading)",
            fontSize: 13,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #1428d4, #0a0f8a)',
            color: 'white',
            boxShadow: '5px 5px 14px rgba(10,15,138,0.38), -3px -3px 9px rgba(255,255,255,0.7)',
          }}
        >
          <IconPlay />
          Continuar — Lección 2: Autenticación
        </button>

        <button
          className="w-full"
          style={{
            padding: '12px',
            borderRadius: 14,
            border: 'none',
            cursor: 'pointer',
            fontFamily: "var(--font-heading)",
            fontSize: 12,
            fontWeight: 600,
            background: '#e8eaf0',
            color: '#1428d4',
            boxShadow: '4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff',
          }}
        >
          Ir al Laboratorio de Simulación
        </button>

      </main>
    </div>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function NavButton({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={item.label}
      className="flex items-center justify-center relative"
      style={{
        width: 48, height: 48,
        borderRadius: 14,
        border: 'none',
        cursor: 'pointer',
        background: active ? 'rgba(20,40,212,0.06)' : '#e8eaf0',
        color: active ? '#1428d4' : '#8892b0',
        boxShadow: active
          ? 'inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff'
          : '4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff',
        transition: 'all 0.18s ease',
      }}
    >
      {item.icon}
    </button>
  )
}

function SecurityStrip() {
  return (
    <div
      className="flex items-center gap-2 mb-4"
      style={{
        background: '#e8eaf0',
        borderRadius: 12,
        padding: '9px 14px',
        boxShadow: 'inset 3px 3px 7px #c2c8d6, inset -3px -3px 7px #ffffff',
      }}
    >
      <span
        style={{
          width: 7, height: 7,
          background: '#00e5a0',
          borderRadius: '50%',
          boxShadow: '0 0 5px rgba(0,229,160,0.7)',
          flexShrink: 0,
          animation: 'pulse 2s infinite',
        }}
      />
      <span style={{ fontSize: 10, color: '#8892b0', fontFamily: "'Space Mono', monospace" }}>
        Cifrado <strong style={{ color: '#00b87d' }}>AES-256</strong> · Sesión activa · JWT 2h TTL
      </span>
    </div>
  )
}

function HeroCard() {
  return (
    <div
      className="relative overflow-hidden mb-4"
      style={{
        background: 'linear-gradient(135deg, #0a0f8a 0%, #1428d4 65%, #1a3ee8 100%)',
        borderRadius: 20,
        padding: '22px 24px',
        boxShadow: '7px 7px 18px rgba(10,15,138,0.38), -4px -4px 12px rgba(255,255,255,0.65)',
      }}
    >
      {/* Círculos decorativos */}
      <div style={{ position: 'absolute', top: -35, right: -35, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      <div style={{ position: 'absolute', bottom: -25, right: 50, width: 100, height: 100, borderRadius: '50%', background: 'rgba(0,229,160,0.12)' }} />

      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 5 }}>
        Buenos días, servidora pública
      </p>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 5, letterSpacing: '-0.3px' }}>
        María Antonia Flores
      </h2>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 18 }}>
        Ciberseguridad para Gobierno Digital
      </p>

      <div className="flex justify-between mb-2">
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: "'Space Mono', monospace" }}>Progreso del curso</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#00e5a0', fontFamily: "'Space Mono', monospace" }}>68%</span>
      </div>
      <div style={{ height: 5, background: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'visible', position: 'relative' }}>
        <div style={{
          height: '100%', width: '68%',
          background: 'linear-gradient(90deg, #00e5a0, #00c98a)',
          borderRadius: 3,
          position: 'relative',
        }}>
          <span style={{
            position: 'absolute', right: -4, top: -4,
            width: 13, height: 13,
            background: '#00e5a0',
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.3)',
            boxShadow: '0 0 8px rgba(0,229,160,0.9)',
            display: 'block',
          }} />
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, iconBg, iconColor, value, label }: { icon: string; iconBg: string; iconColor: string; value: string; label: string }) {
  return (
    <div style={{ background: '#e8eaf0', borderRadius: 16, padding: '16px 12px', boxShadow: '5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff' }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, background: iconBg, boxShadow: 'inset 2px 2px 5px #c2c8d6, inset -2px -2px 5px #ffffff', fontSize: 14 }}>
        {icon}
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#0a0f8a', fontFamily: "'Space Mono', monospace", lineHeight: 1, marginBottom: 3 }}>{value}</div>
      <div style={{ fontSize: 10, color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </div>
  )
}

function CheckIn({ selectedMood, onSelect }: { selectedMood: MoodValue; onSelect: (v: MoodValue) => void }) {
  return (
    <div style={{ background: '#e8eaf0', borderRadius: 18, padding: 18, marginBottom: 16, boxShadow: '6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff' }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: '#8892b0', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 13, fontFamily: "'Space Mono', monospace" }}>
        Check-in · ¿Cómo llegás hoy?
      </p>
      <div className="flex justify-between gap-2">
        {MOODS.map((mood, i) => (
          <button
            key={i}
            onClick={() => onSelect((i + 1) as MoodValue)}
            style={{
              flex: 1, height: 46,
              border: 'none',
              borderRadius: 13,
              cursor: 'pointer',
              fontSize: 18,
              background: selectedMood === i + 1 ? 'rgba(20,40,212,0.05)' : '#e8eaf0',
              boxShadow: selectedMood === i + 1
                ? 'inset 3px 3px 7px #c2c8d6, inset -3px -3px 7px #ffffff'
                : '4px 4px 9px #c2c8d6, -4px -4px 9px #ffffff',
              transition: 'all 0.15s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {mood}
          </button>
        ))}
      </div>
    </div>
  )
}

function LessonesPanel({ lessons }: { lessons: LessonItem[] }) {
  return (
    <div style={{ background: '#e8eaf0', borderRadius: 18, padding: 18, boxShadow: '6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff' }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: '#8892b0', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 13, fontFamily: "'Space Mono', monospace" }}>
        Módulo 3 · Lecciones
      </p>
      {lessons.map((lesson) => (
        <LessonRow key={lesson.num} lesson={lesson} />
      ))}
    </div>
  )
}

function LessonRow({ lesson }: { lesson: LessonItem }) {
  const isActive = lesson.status === 'current'

  const numStyles: Record<LessonItem['status'], React.CSSProperties> = {
    done:    { background: 'rgba(0,229,160,0.15)', color: '#00b87d', boxShadow: 'inset 2px 2px 4px rgba(0,229,160,0.2), inset -2px -2px 4px rgba(255,255,255,0.8)' },
    current: { background: '#1428d4', color: 'white', boxShadow: '3px 3px 7px rgba(20,40,212,0.4), -2px -2px 5px rgba(255,255,255,0.6)' },
    locked:  { background: 'rgba(136,146,176,0.12)', color: '#8892b0', boxShadow: 'inset 2px 2px 4px #c2c8d6, inset -2px -2px 4px #ffffff' },
  }

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 10px',
        borderRadius: 11,
        marginBottom: 7,
        cursor: 'pointer',
        background: isActive ? 'rgba(20,40,212,0.04)' : 'transparent',
        boxShadow: isActive
          ? 'inset 2px 2px 5px #c2c8d6, inset -2px -2px 5px #ffffff'
          : '3px 3px 7px #c2c8d6, -3px -3px 7px #ffffff',
      }}
    >
      <div style={{ width: 30, height: 30, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, fontFamily: "'Space Mono', monospace", flexShrink: 0, ...numStyles[lesson.status] }}>
        {lesson.status === 'done' ? '✓' : lesson.num}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#0a0f8a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 2 }}>{lesson.title}</p>
        <p style={{ fontSize: 9, color: '#8892b0', fontFamily: "'Space Mono', monospace" }}>{lesson.duration} · {lesson.status === 'done' ? 'Completado' : lesson.status === 'current' ? 'En curso' : 'Pendiente'}</p>
      </div>
    </div>
  )
}

function LogrosPanel({ logros }: { logros: LogroItem[] }) {
  return (
    <div style={{ background: '#e8eaf0', borderRadius: 18, padding: 18, boxShadow: '6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff' }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: '#8892b0', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 13, fontFamily: "'Space Mono', monospace" }}>
        Mis logros
      </p>
      <div className="grid grid-cols-3 gap-2">
        {logros.map((logro, i) => (
          <div
            key={i}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              padding: '10px 6px',
              borderRadius: 11,
              cursor: 'pointer',
              opacity: logro.earned ? 1 : 0.38,
              boxShadow: logro.earned
                ? '3px 3px 7px #c2c8d6, -3px -3px 7px #ffffff'
                : 'inset 2px 2px 5px #c2c8d6, inset -2px -2px 5px #ffffff',
            }}
          >
            <div style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, background: logro.bg }}>
              {logro.icon}
            </div>
            <p style={{ fontSize: 8, textAlign: 'center', color: '#4a5580', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', lineHeight: 1.2 }}>
              {logro.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ActivityPanel({ activity }: { activity: ActivityItem[] }) {
  return (
    <div style={{ background: '#e8eaf0', borderRadius: 18, padding: 18, marginBottom: 16, boxShadow: '6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff' }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: '#8892b0', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 13, fontFamily: "'Space Mono', monospace" }}>
        Actividad reciente
      </p>
      {activity.map((item, i) => (
        <div
          key={i}
          style={{
            display: 'flex', alignItems: 'center', gap: 11,
            padding: '9px 0',
            borderBottom: i < activity.length - 1 ? '1px solid rgba(194,200,214,0.35)' : 'none',
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: item.color, flexShrink: 0, display: 'block' }} />
          <p style={{ flex: 1, fontSize: 11, color: '#4a5580', lineHeight: 1.4 }}>
            <strong style={{ color: '#0a0f8a', fontWeight: 600 }}>{item.title}</strong>
            {' — '}
            {item.description}
          </p>
          <span style={{ fontSize: 9, color: '#8892b0', fontFamily: "'Space Mono', monospace", flexShrink: 0 }}>{item.time}</span>
        </div>
      ))}
    </div>
  )
}
