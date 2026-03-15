'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { predictCompletion } from '@/lib/utils/completion-prediction'
import { usePathname, useRouter } from 'next/navigation'
import { AssistantFab } from '@/components/assistant/AssistantFab'
import CognitiveCheckin from '@/components/cognitive/CognitiveCheckin'
import SpacedRepCard from '@/components/learning/SpacedRepCard'
import InactivityGuard from '@/components/auth/InactivityGuard'
import OfflineBanner from '@/components/offline/OfflineBanner'
import { useTheme } from '@/lib/hooks/useTheme'

// ─── Tipos ───────────────────────────────────────────────────────────────────
type MoodValue = 'bien' | 'regular' | 'dificil' | 'excelente' | null
type NavKey = 'inicio' | 'curso' | 'tareas' | 'comunidad' | 'perfil'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

interface LessonItem {
  id: string
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

interface NotifItem {
  icon: string
  iconBg: string
  title: string
  sub: string
  isNew: boolean
}

// ─── Escala de tipografía (más grande) ────────────────────────────────────────
const f = (n: number) => Math.round(n * 1.3)

// ─── Tipo para tema (light/dark) ──────────────────────────────────────────────
type DashboardTheme = {
  bg: string
  elevated: string
  elevatedSm: string
  elevatedLg: string
  inset: string
  insetSm: string
  sidebarLeft: string
  sidebarRight: string
  text: string
  muted: string
  muted2: string
  border: string
  border2: string
}

// ─── Constantes de diseño (light) ──────────────────────────────────────────────
const NM_LIGHT: DashboardTheme = {
  bg: '#e8eaf0',
  elevated:    '6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff',
  elevatedSm:  '4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff',
  elevatedLg:  '8px 8px 18px #c2c8d6, -8px -8px 18px #ffffff',
  inset:       'inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff',
  insetSm:     'inset 2px 2px 5px #c2c8d6, inset -2px -2px 5px #ffffff',
  sidebarLeft: '5px 0 16px #c2c8d6, 1px 0 4px #ffffff',
  sidebarRight:'-4px 0 14px #c2c8d6, -1px 0 4px #ffffff',
  text:        '#0a0f8a',
  muted:       '#8892b0',
  muted2:      '#4a5580',
  border:      'rgba(194,200,214,0.25)',
  border2:     'rgba(194,200,214,0.3)',
}

const NM_DARK: DashboardTheme = {
  bg: '#1a1f2e',
  elevated:    '6px 6px 14px rgba(0,0,0,0.4), -6px -6px 14px rgba(255,255,255,0.03)',
  elevatedSm:  '4px 4px 10px rgba(0,0,0,0.35), -4px -4px 10px rgba(255,255,255,0.03)',
  elevatedLg:  '8px 8px 18px rgba(0,0,0,0.45), -8px -8px 18px rgba(255,255,255,0.04)',
  inset:       'inset 3px 3px 8px rgba(0,0,0,0.35), inset -3px -3px 8px rgba(255,255,255,0.03)',
  insetSm:     'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(255,255,255,0.03)',
  sidebarLeft: '5px 0 16px rgba(0,0,0,0.4), 1px 0 4px rgba(255,255,255,0.02)',
  sidebarRight:'-4px 0 14px rgba(0,0,0,0.35), -1px 0 4px rgba(255,255,255,0.02)',
  text:        '#e2e8f0',
  muted:       '#94a3b8',
  muted2:       '#a8b4c4',
  border:      'rgba(255,255,255,0.08)',
  border2:     'rgba(255,255,255,0.1)',
}

// ─── Íconos SVG inline (decorativos: aria-hidden, focusable=false) ─────────────
const svgAria = { 'aria-hidden': true, focusable: false }
const IcoGrid = () => <svg {...svgAria} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
const IcoBook = () => <svg {...svgAria} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
const IcoCalendar = () => <svg {...svgAria} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const IcoCheck = () => <svg {...svgAria} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
const IcoUsers = () => <svg {...svgAria} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const IcoMsg = () => <svg {...svgAria} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const IcoLab = () => <svg {...svgAria} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
const IcoUser = () => <svg {...svgAria} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IcoLogout = () => <svg {...svgAria} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const IcoPlay = () => <svg {...svgAria} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
const IcoLayers = () => <svg {...svgAria} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
const IcoHelp = () => <svg {...svgAria} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>

// ─── Navegación franja izquierda (cuadrados neumórficos) ───────────────────────
const IcoPortfolio = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
const IcoKnowledge = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/><path d="M12 5a7 7 0 0 0-7 7c0 2.5 1.5 4 3 5l4-4 4 4c1.5-1 3-2.5 3-5a7 7 0 0 0-7-7z"/></svg>
const IcoRetos = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
const NAV_ITEMS: NavItem[] = [
  { href: '/inicio', label: 'Inicio', icon: <IcoGrid /> },
  { href: '/curso', label: 'Mi Curso', icon: <IcoBook /> },
  { href: '/sesiones-en-vivo', label: 'Sesiones', icon: <IcoCalendar /> },
  { href: '/tareas', label: 'Tareas', icon: <IcoCheck /> },
  { href: '/comunidad', label: 'Comunidad', icon: <IcoUsers /> },
  { href: '/mi-colega', label: 'Mi Colega', icon: <IcoMsg /> },
  { href: '/laboratorio', label: 'Laboratorio', icon: <IcoLab /> },
  { href: '/portafolio', label: 'Portafolio', icon: <IcoPortfolio /> },
  { href: '/conocimiento', label: 'Conocimiento', icon: <IcoKnowledge /> },
  { href: '/retos', label: 'Retos', icon: <IcoRetos /> },
]

// ─── Datos estáticos (TODO: conectar con Firebase hooks) ──────────────────────
const LESSONS: LessonItem[] = [
  { id: 'mod3-leccion-1', num: 1, title: 'Cifrado E2E',     duration: '8 min',  status: 'done' },
  { id: 'mod3-leccion-2', num: 2, title: 'Autenticación',   duration: '12 min', status: 'current' },
  { id: 'mod3-leccion-3', num: 3, title: 'Zero Trust',      duration: '15 min', status: 'locked' },
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
  { color: '#00e5a0', title: 'Quiz completado',    description: 'Módulo 2: 92/100 puntos',  time: 'Hace 2h' },
  { color: '#1428d4', title: 'Lección terminada',  description: 'Cifrado E2E y protocolos', time: 'Ayer' },
  { color: '#ffc107', title: 'Logro desbloqueado', description: 'Defensor Digital',         time: 'Lun' },
]

const NOTIFS: NotifItem[] = [
  { icon: '📋', iconBg: 'rgba(0,229,160,0.15)',   title: 'Quiz disponible',    sub: 'Módulo 3 · Hoy 16:00',      isNew: true },
  { icon: '🎙️', iconBg: 'rgba(20,40,212,0.12)',   title: 'Sesión en vivo',     sub: 'Mañana 10:00 AM',            isNew: true },
  { icon: '⭐',  iconBg: 'rgba(255,186,0,0.14)',   title: 'Logro cerca',        sub: 'Completa 1 lección más',     isNew: false },
  { icon: '📝',  iconBg: 'rgba(229,57,53,0.1)',    title: 'Tarea pendiente',    sub: 'Vence el 18 Mar',            isNew: true },
]

// Días del calendario Marzo 2026 con eventos
const CAL_EVENTS = [10, 15, 18, 22, 25]
const CAL_FIRST_DAY = 6 // Marzo 2026 empieza en domingo (índice 6 con Lunes=0)
const CAL_DAYS = 31

// ─── Componente principal ─────────────────────────────────────────────────────
export default function DashboardAlumno() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'
  const NM = isDark ? NM_DARK : NM_LIGHT
  const [selectedMood, setSelectedMood] = useState<MoodValue>(null)

  const handleCerrarSesion = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    router.push('/login')
    router.refresh()
  }
  const [nota, setNota] = useState('')
  const [notaGuardada, setNotaGuardada] = useState(false)

  const handleGuardarNota = () => {
    if (nota.trim()) {
      setNotaGuardada(true)
      setTimeout(() => setNotaGuardada(false), 2000)
    }
  }

  const [showCheckin, setShowCheckin] = useState(false)
  const [pendingLesson, setPendingLesson] = useState<{ id: string; title: string } | null>(null)

  const handleOpenLesson = (lessonId: string, lessonTitle: string) => {
    setPendingLesson({ id: lessonId, title: lessonTitle })
    setShowCheckin(true)
  }

  const handleCheckinComplete = (level: 'optimo' | 'moderado' | 'bajo') => {
    setShowCheckin(false)
    const id = pendingLesson?.id
    setPendingLesson(null)
    if (id) router.push(`/curso/lecciones/${id}?mode=${level}`)
  }

  const [showRightPanel, setShowRightPanel] = useState(false)

  const [dashboardProgress, setDashboardProgress] = useState<{ lessonsDone: number; lessonsTotal: number } | null>(null)
  useEffect(() => {
    fetch('/api/dashboard', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { progress?: { lessonsDone: number; lessonsTotal: number } } | null) => {
        if (d?.progress) setDashboardProgress({ lessonsDone: d.progress.lessonsDone, lessonsTotal: d.progress.lessonsTotal })
      })
      .catch(() => {})
  }, [])

  const completionPrediction = useMemo(() => {
    if (!dashboardProgress || dashboardProgress.lessonsTotal === 0) return null
    const { lessonsDone, lessonsTotal } = dashboardProgress
    const now = new Date()
    const firstActivity = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    return predictCompletion(lessonsDone, lessonsTotal, firstActivity, now)
  }, [dashboardProgress])

  const bottomNavActive: NavKey = pathname === '/inicio' || pathname?.startsWith('/inicio') ? 'inicio'
    : pathname?.startsWith('/curso') ? 'curso'
    : pathname?.startsWith('/tareas') ? 'tareas'
    : pathname?.startsWith('/comunidad') ? 'comunidad'
    : pathname?.startsWith('/mi-perfil') ? 'perfil'
    : 'inicio'

  const handleBottomNav = (key: NavKey) => {
    const href = key === 'inicio' ? '/inicio' : key === 'curso' ? '/curso' : key === 'tareas' ? '/tareas' : key === 'comunidad' ? '/comunidad' : '/mi-perfil'
    router.push(href)
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: NM.bg, fontFamily: "'Syne', sans-serif", color: NM.text }}
    >
      <OfflineBanner />
      {/* ── FRANJA IZQUIERDA: cuadrados neumórficos ────────────────────── */}
      <aside
        className="sidebar-left flex flex-col items-center py-5 flex-shrink-0 relative z-10"
        style={{ width: 72, background: NM.bg, boxShadow: NM.sidebarLeft }}
        role="navigation"
        aria-label="Menú principal"
      >
        <div
          className="flex items-center justify-center mb-6 flex-shrink-0"
          style={{
            width: 42, height: 42, borderRadius: 13,
            background: 'linear-gradient(135deg, #1428d4, #0a0f8a)',
            boxShadow: '5px 5px 12px #c2c8d6, -3px -3px 8px #ffffff',
          }}
          aria-hidden
        >
          <IcoLayers />
        </div>
        <nav className="flex flex-col gap-2 items-center w-full" role="navigation">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== '/inicio' && pathname?.startsWith(item.href))
            return (
              <SidebarNavSquare
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={active}
                theme={NM}
              />
            )
          })}
        </nav>
        <div className="flex-1" />
        <div className="flex flex-col gap-2 w-full items-center">
          <SidebarNavSquare href="/mi-perfil" label="Mi perfil" icon={<IcoUser />} active={pathname === '/mi-perfil' || pathname?.startsWith('/mi-perfil')} theme={NM} />
          <button
            type="button"
            onClick={handleCerrarSesion}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 46, height: 46, borderRadius: 13,
              border: 'none', cursor: 'pointer',
              background: NM.bg, color: NM.muted,
              boxShadow: NM.elevatedSm,
              transition: 'all 0.18s ease',
            }}
          >
            <IcoLogout />
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <main
        className="main-content flex-1 overflow-y-auto min-w-0"
        style={{ padding: '18px 16px' }}
        role="main"
        aria-label="Dashboard del alumno"
      >
        {/* Top bar */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 style={{ fontSize: f(20), fontWeight: 800, color: NM.text, letterSpacing: '-0.4px', lineHeight: 1 }}>
              Política Digital
            </h1>
            <p style={{ fontSize: f(12), color: NM.muted, marginTop: 2, fontFamily: "'Space Mono', monospace" }}>
              // Módulo 3 · Ciberseguridad · Grupo 2026-A
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Modo oscuro */}
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              title={isDark ? 'Usar modo claro' : 'Usar modo oscuro'}
              aria-label={isDark ? 'Usar modo claro' : 'Usar modo oscuro'}
              style={{
                padding: '6px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontFamily: "'Syne', sans-serif", fontSize: f(10), fontWeight: 700,
                background: NM.bg, color: NM.muted2, boxShadow: NM.insetSm,
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            {/* ¿Cómo funciona? */}
            <button
              type="button"
              aria-label="¿Cómo funciona?"
              style={{
                padding: '6px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontFamily: "'Syne', sans-serif", fontSize: f(10), fontWeight: 700,
                background: NM.bg, color: NM.muted2, boxShadow: NM.insetSm,
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <IcoHelp />
              ¿Cómo funciona?
            </button>
            {/* Botón panel derecho (tablet/mobile) */}
            <button
              type="button"
              className="panel-right-btn"
              onClick={() => setShowRightPanel(!showRightPanel)}
              aria-label="Abrir panel de perfil y logros"
              style={{
                display: 'none',
                width: 44, height: 44, minWidth: 44, minHeight: 44, borderRadius: 12, border: 'none',
                cursor: 'pointer', background: NM.bg,
                boxShadow: '4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff',
                color: '#1428d4', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <IcoUser />
            </button>
            {/* Fecha */}
            <span className="topbar-date-desktop" style={{ background: NM.bg, borderRadius: 10, padding: '6px 11px', boxShadow: NM.insetSm, fontSize: f(10), color: NM.muted2, fontFamily: "'Space Mono', monospace" }}>
              Dom 15 Mar 2026
            </span>
            <span className="topbar-date-mobile" style={{ background: NM.bg, borderRadius: 10, padding: '6px 11px', boxShadow: NM.insetSm, fontSize: f(10), color: NM.muted2, fontFamily: "'Space Mono', monospace" }}>
              15 Mar
            </span>
            {/* Online */}
            <div className="flex items-center gap-1" style={{ fontSize: f(10), color: NM.muted, fontFamily: "'Space Mono', monospace" }} role="status" aria-label="Estado: en línea">
              <span className="sec-dot" style={{ width: 7, height: 7, background: '#00e5a0', borderRadius: '50%', display: 'block', boxShadow: '0 0 5px rgba(0,229,160,0.8)', animation: 'pulse 2s infinite' }} />
              En línea
            </div>
          </div>
        </div>

        {/* Security strip */}
        <div
          className="flex items-center gap-2 mb-4"
          style={{ background: NM.bg, borderRadius: 11, padding: '8px 13px', boxShadow: NM.inset }}
          role="status"
          aria-label="Conexión segura"
        >
          <span className="sec-dot" style={{ width: 6, height: 6, background: '#00e5a0', borderRadius: '50%', display: 'block', boxShadow: '0 0 5px rgba(0,229,160,0.7)', flexShrink: 0, animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: f(12), color: NM.muted, fontFamily: "'Space Mono', monospace" }}>
            Cifrado <strong style={{ color: '#00b87d' }}>AES-256</strong> · Sesión verificada · JWT 2h TTL · Datos protegidos
          </span>
        </div>

        <SpacedRepCard />

        {/* Hero */}
        <section
          className="relative overflow-hidden mb-4"
          style={{
            background: 'linear-gradient(135deg, #0a0f8a 0%, #1428d4 65%, #1a3ee8 100%)',
            borderRadius: 18,
            padding: 'clamp(16px, 4vw, 22px) clamp(16px, 4vw, 24px)',
            boxShadow: '7px 7px 18px rgba(10,15,138,0.35), -4px -4px 12px rgba(255,255,255,0.6)',
          }}
          aria-label="Bienvenida y progreso"
        >
          <div style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} aria-hidden />
          <div style={{ position: 'absolute', bottom: -20, right: 40, width: 90, height: 90, borderRadius: '50%', background: 'rgba(0,229,160,0.12)' }} aria-hidden />
          <p style={{ fontSize: f(11), color: 'rgba(255,255,255,0.5)', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 4 }}>
            Buenas tardes
          </p>
          <h2 style={{ fontSize: 'clamp(15px, 4vw, 20px)', fontWeight: 800, color: 'white', marginBottom: 3, letterSpacing: '-0.3px' }}>
            María Antonia Flores
          </h2>
          <p style={{ fontSize: f(12), color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>
            Ciberseguridad para Gobierno Digital · La innovación no es un destino, es una forma de caminar.
          </p>
          <div className="flex justify-between mb-2">
            <span style={{ fontSize: f(12), color: 'rgba(255,255,255,0.5)', fontFamily: "'Space Mono', monospace" }}>Progreso del curso</span>
            <span style={{ fontSize: f(14), fontWeight: 700, color: '#00e5a0', fontFamily: "'Space Mono', monospace" }}>68%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={68}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progreso del curso: 68%"
            style={{ height: 5, background: 'rgba(255,255,255,0.15)', borderRadius: 3, position: 'relative' }}
          >
            <div style={{ height: '100%', width: '68%', background: 'linear-gradient(90deg, #00e5a0, #00c98a)', borderRadius: 3, position: 'relative' }}>
              <span style={{ position: 'absolute', right: -4, top: -4, width: 13, height: 13, background: '#00e5a0', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', boxShadow: '0 0 8px rgba(0,229,160,0.9)', display: 'block' }} aria-hidden />
            </div>
          </div>
          {completionPrediction && (
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 8, fontFamily: "'Space Mono', monospace" }}>
              📅 A este ritmo terminas el {completionPrediction.date}
            </p>
          )}
          <div className="flex gap-2 mt-4">
            <button type="button" aria-label="Continuar con la lección 2: Autenticación" style={{ padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: "'Syne', sans-serif", fontSize: f(14), fontWeight: 700, background: '#ffffff', color: '#0a0f8a', boxShadow: '3px 3px 8px rgba(0,0,0,0.15)' }}>
              Continuar →
            </button>
            <button type="button" aria-label="Ver programa del curso" style={{ padding: '10px 20px', borderRadius: 10, border: '2px solid rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: "'Syne', sans-serif", fontSize: f(14), fontWeight: 600, background: 'transparent', color: '#ffffff' }}>
              Ver programa
            </button>
          </div>
        </section>

        {/* Check-in */}
        <section style={{ background: NM.bg, borderRadius: 16, padding: 16, marginBottom: 14, boxShadow: NM.elevated }} aria-label="Check-in de bienestar">
          <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
            <legend className="sr-only">¿Cómo llegaste hoy?</legend>
            <p style={{ fontSize: f(11), fontWeight: 700, color: NM.muted, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 12, fontFamily: "'Space Mono', monospace" }}>
              Check-in · ¿Cómo llegaste hoy?
            </p>
            <div className="checkin-grid flex gap-2" role="radiogroup" aria-label="Estado de ánimo">
              {(['😊 Bien', '😐 Regular', '😓 Difícil', '💪 Excelente'] as const).map((label, i) => {
                const val = (['bien', 'regular', 'dificil', 'excelente'] as MoodValue[])[i]
                const ariaLabel = label === '😊 Bien' ? 'Bien' : label === '😐 Regular' ? 'Regular' : label === '😓 Difícil' ? 'Difícil' : 'Excelente'
                return (
                  <button
                    key={i}
                    type="button"
                    role="radio"
                    aria-checked={selectedMood === val}
                    aria-label={ariaLabel}
                    onClick={() => setSelectedMood(val)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedMood(val) } }}
                    style={{
                      flex: 1, padding: '10px 6px', minHeight: 44, border: 'none', borderRadius: 11, cursor: 'pointer',
                      fontFamily: "'Syne', sans-serif", fontSize: f(13), fontWeight: 600,
                      background: selectedMood === val ? 'rgba(20,40,212,0.05)' : NM.bg,
                      color: selectedMood === val ? '#1428d4' : NM.muted2,
                      boxShadow: selectedMood === val ? NM.insetSm : NM.elevatedSm,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </fieldset>
          <div aria-live="polite" aria-atomic={true} className="sr-only">
            {selectedMood ? `Seleccionaste: ${selectedMood === 'bien' ? 'Bien' : selectedMood === 'regular' ? 'Regular' : selectedMood === 'dificil' ? 'Difícil' : 'Excelente'}` : ''}
          </div>
        </section>

        {/* Lecciones + Notificaciones */}
        <div className="lessons-notifs-grid grid grid-cols-2 gap-3 mb-4">
          {/* Lecciones */}
          <section style={{ background: NM.bg, borderRadius: 16, padding: 16, boxShadow: NM.elevated }} aria-labelledby="lecciones-heading">
            <h3 id="lecciones-heading" style={{ fontSize: f(11), fontWeight: 700, color: NM.muted, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 12, fontFamily: "'Space Mono', monospace" }}>
              Módulo 3 · Lecciones
            </h3>
            {LESSONS.map((lesson) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                theme={NM}
                onLessonClick={lesson.status !== 'locked' ? handleOpenLesson : undefined}
              />
            ))}
          </section>
          {/* Notificaciones */}
          <section style={{ background: NM.bg, borderRadius: 16, padding: 16, boxShadow: NM.elevated }} aria-labelledby="notificaciones-heading">
            <h3 id="notificaciones-heading" style={{ fontSize: f(11), fontWeight: 700, color: NM.muted, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 12, fontFamily: "'Space Mono', monospace" }}>
              Notificaciones
            </h3>
            {NOTIFS.map((n, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 0', borderBottom: i < NOTIFS.length - 1 ? `1px solid ${NM.border}` : 'none' }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, background: n.iconBg, flexShrink: 0, boxShadow: NM.insetSm }}>{n.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: f(12), fontWeight: 600, color: NM.text, marginBottom: 1, lineHeight: 1.3 }}>{n.title}</p>
                  <p style={{ fontSize: f(10), color: NM.muted, fontFamily: "'Space Mono', monospace" }}>{n.sub}</p>
                </div>
                {n.isNew && <span style={{ width: 6, height: 6, background: '#00e5a0', borderRadius: '50%', display: 'block', flexShrink: 0, marginTop: 4 }} />}
              </div>
            ))}
          </section>
        </div>

        {/* Actividad */}
        <section style={{ background: NM.bg, borderRadius: 16, padding: 16, marginBottom: 14, boxShadow: NM.elevated }} aria-labelledby="actividad-heading">
          <h3 id="actividad-heading" style={{ fontSize: f(11), fontWeight: 700, color: NM.muted, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 12, fontFamily: "'Space Mono', monospace" }}>
            Actividad reciente
          </h3>
          {ACTIVITY.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < ACTIVITY.length - 1 ? `1px solid ${NM.border2}` : 'none' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0, display: 'block' }} />
              <p style={{ flex: 1, fontSize: f(12), color: NM.muted2, lineHeight: 1.4 }}>
                <strong style={{ color: NM.text, fontWeight: 600 }}>{item.title}</strong>{' — '}{item.description}
              </p>
              <span style={{ fontSize: f(11), color: NM.muted, fontFamily: "'Space Mono', monospace", flexShrink: 0 }}>{item.time}</span>
            </div>
          ))}
        </section>

        {/* CTAs */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 mb-3"
          aria-label="Continuar con la lección 2: Autenticación"
          style={{ padding: 14, minHeight: 44, borderRadius: 13, border: 'none', cursor: 'pointer', fontFamily: "'Syne', sans-serif", fontSize: f(14), fontWeight: 700, background: 'linear-gradient(135deg, #1428d4, #0a0f8a)', color: 'white', boxShadow: '5px 5px 12px rgba(10,15,138,0.35), -3px -3px 8px rgba(255,255,255,0.7)' }}
        >
          <IcoPlay />
          Continuar — Lección 2: Autenticación
        </button>
        <button
          type="button"
          className="w-full"
          aria-label="Ir al Laboratorio de Simulación"
          style={{ padding: 12, minHeight: 44, borderRadius: 13, border: 'none', cursor: 'pointer', fontFamily: "'Syne', sans-serif", fontSize: f(13), fontWeight: 600, background: NM.bg, color: '#1428d4', boxShadow: NM.elevatedSm }}
        >
          Ir al Laboratorio de Simulación
        </button>
      </main>

      {/* ── PANEL DERECHO (neumorfismo) ───────────────────────────────── */}
      <aside
        className={`panel-right flex-shrink-0 overflow-y-auto ${showRightPanel ? 'open' : ''}`}
        style={{
          width: 360,
          marginTop: 16,
          padding: '18px 16px',
          background: NM.bg,
          borderRadius: 20,
          boxShadow: isDark ? '8px 8px 18px rgba(0,0,0,0.4), -8px -8px 18px rgba(255,255,255,0.03)' : '8px 8px 18px #c2c8d6, -8px -8px 18px #ffffff, -2px 0 12px rgba(194,200,214,0.4)',
        }}
        role="complementary"
        aria-label="Información del alumno"
      >
        {/* Perfil */}
        <section style={{ background: NM.bg, borderRadius: 16, padding: 16, marginBottom: 12, boxShadow: NM.elevated, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }} aria-labelledby="perfil-stats-heading">
          <div role="img" aria-label="Avatar de María A. Flores" style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #1428d4, #0a0f8a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: f(18), fontWeight: 800, color: 'white', marginBottom: 10, boxShadow: NM.elevatedSm }}>
            MA
          </div>
          <p style={{ fontSize: f(15), fontWeight: 700, color: NM.text, marginBottom: 10 }}>María A. Flores</p>
          <h3 id="perfil-stats-heading" className="sr-only">Estadísticas del curso</h3>
          <dl className="grid grid-cols-2 gap-2 w-full" style={{ margin: 0 }}>
            {[['68%','Progreso'],['5','Logros'],['8.7','Calific.'],['7d','Racha']].map(([val,lbl],i) => (
              <div key={i} style={{ background: NM.bg, borderRadius: 10, padding: '10px 8px', boxShadow: NM.insetSm, textAlign: 'center' }}>
                <dt style={{ fontSize: f(10), color: NM.muted, textTransform: 'uppercase', letterSpacing: '0.4px', margin: 0 }}>{lbl}</dt>
                <dd style={{ fontSize: f(16), fontWeight: 800, color: NM.text, fontFamily: "'Space Mono', monospace", lineHeight: 1, marginBottom: 0, marginTop: 2 }}>{val}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Notas */}
        <div style={{ background: NM.bg, borderRadius: 16, padding: 14, marginBottom: 12, boxShadow: NM.elevated }}>
          <SectionTitle theme={NM}>Mis notas</SectionTitle>
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Escribe aquí tus notas y envíalas."
            aria-label="Campo de notas personales"
            style={{
              width: '100%', border: 'none', background: NM.bg, borderRadius: 10, padding: 12,
              fontFamily: "'Syne', sans-serif", fontSize: f(13), color: NM.muted2,
              resize: 'none', outline: 'none', boxShadow: NM.inset,
              lineHeight: 1.5, minHeight: 90,
            }}
          />
          <button
            type="button"
            onClick={handleGuardarNota}
            aria-label={notaGuardada ? 'Nota enviada' : 'Enviar nota'}
            style={{
              width: '100%', marginTop: 8, padding: '10px', minHeight: 44, borderRadius: 9, border: 'none', cursor: 'pointer',
              fontFamily: "'Syne', sans-serif", fontSize: f(12), fontWeight: 700,
              background: NM.bg, color: notaGuardada ? '#00b87d' : '#1428d4',
              boxShadow: NM.elevatedSm,
            }}
          >
            {notaGuardada ? '✓ Enviado' : 'Enviar'}
          </button>
          <div aria-live="polite" aria-atomic={true} className="sr-only">
            {notaGuardada ? 'Nota guardada exitosamente' : ''}
          </div>
        </div>

        {/* Logros */}
        <section style={{ background: NM.bg, borderRadius: 16, padding: 14, marginBottom: 12, boxShadow: NM.elevated }} aria-labelledby="logros-heading">
          <h3 id="logros-heading" style={{ fontSize: f(11), fontWeight: 700, color: NM.muted, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 12, fontFamily: "'Space Mono', monospace" }}>
            Mis logros
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {LOGROS.map((logro, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: '10px 6px', borderRadius: 10, cursor: 'pointer',
                  opacity: logro.earned ? 1 : 0.35,
                  boxShadow: logro.earned ? NM.elevatedSm : NM.insetSm,
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, background: logro.bg }}>
                  {logro.icon}
                </div>
                <p style={{ fontSize: f(8), textAlign: 'center', color: NM.muted2, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', lineHeight: 1.2 }}>
                  {logro.name}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Calendario */}
        <div style={{ background: NM.bg, borderRadius: 12, padding: 10, marginBottom: 12, boxShadow: NM.elevated, maxWidth: 200 }}>
          <div className="flex justify-between items-center mb-1">
            <span style={{ fontSize: f(11), fontWeight: 700, color: NM.text }}>Marzo 2026</span>
            <div className="flex gap-0.5">
              {['‹','›'].map((ch,i) => (
                <button key={i} type="button" style={{ width: 18, height: 18, borderRadius: 4, border: 'none', cursor: 'pointer', background: NM.bg, color: NM.muted, fontSize: f(10), display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: NM.insetSm }}>{ch}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-7 mb-0.5" style={{ gap: 1 }}>
            {['L','M','X','J','V','S','D'].map(d => (
              <div key={d} style={{ fontSize: f(8), color: NM.muted, textAlign: 'center', fontFamily: "'Space Mono', monospace" }}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7" style={{ gap: 1 }}>
            {Array.from({ length: CAL_FIRST_DAY }).map((_,i) => (
              <div key={`e-${i}`} style={{ aspectRatio: '1', minWidth: 0 }} />
            ))}
            {Array.from({ length: CAL_DAYS }).map((_,i) => {
              const day = i + 1
              const isToday = day === 15
              const hasEvent = CAL_EVENTS.includes(day) && !isToday
              return (
                <div
                  key={day}
                  role="button"
                  tabIndex={0}
                  aria-label={isToday ? `Hoy, ${day} de marzo` : `Día ${day} de marzo`}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.preventDefault() }}
                  style={{
                    aspectRatio: '1', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    minWidth: 36, minHeight: 36,
                    fontSize: f(9), fontFamily: "'Space Mono', monospace", fontWeight: 600, cursor: 'pointer',
                    position: 'relative',
                    background: isToday ? '#1428d4' : NM.bg,
                    color: isToday ? '#ffffff' : NM.muted,
                    boxShadow: isToday ? '1px 1px 4px rgba(20,40,212,0.4), -1px -1px 3px rgba(255,255,255,0.5)' : NM.insetSm,
                  }}
                >
                  {day}
                  {hasEvent && (
                    <span style={{ position: 'absolute', bottom: 0, width: 2, height: 2, background: '#00e5a0', borderRadius: '50%', display: 'block' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </aside>
      <BottomNav active={bottomNavActive} onChange={handleBottomNav} />
      <AssistantFab />
      <InactivityGuard />
      {showCheckin && pendingLesson && (
        <CognitiveCheckin
          lessonTitle={pendingLesson.title}
          lessonId={pendingLesson.id}
          onComplete={handleCheckinComplete}
          onClose={() => { setShowCheckin(false); setPendingLesson(null) }}
        />
      )}
    </div>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

/** Navegación inferior móvil (5 íconos). Visible solo en viewport &lt; 768px por CSS. */
function BottomNav({ active, onChange }: { active: NavKey; onChange: (k: NavKey) => void }) {
  const items: { key: NavKey; icon: React.ReactNode; label: string }[] = [
    { key: 'inicio', icon: <IcoGrid />, label: 'Inicio' },
    { key: 'curso', icon: <IcoBook />, label: 'Curso' },
    { key: 'tareas', icon: <IcoCheck />, label: 'Tareas' },
    { key: 'comunidad', icon: <IcoUsers />, label: 'Comunidad' },
    { key: 'perfil', icon: <IcoUser />, label: 'Perfil' },
  ]
  return (
    <nav
      className="bottom-nav"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#e8eaf0',
        padding: '10px 0 20px',
        display: 'none',
        justifyContent: 'space-around',
        alignItems: 'center',
        boxShadow: '0 -4px 16px #c2c8d6, 0 -1px 4px #ffffff',
        zIndex: 40,
      }}
      aria-label="Navegación principal"
    >
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 3, padding: '6px 14px', borderRadius: 12, border: 'none',
            cursor: 'pointer', fontFamily: "'Syne', sans-serif",
            background: active === item.key ? 'rgba(20,40,212,0.06)' : 'transparent',
            color: active === item.key ? '#1428d4' : '#8892b0',
            boxShadow: active === item.key
              ? 'inset 2px 2px 6px #c2c8d6, inset -2px -2px 6px #ffffff'
              : 'none',
          }}
        >
          {item.icon}
          <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  )
}

/** Cuadrado neumórfico del menú izquierdo: enlace con estilo elevado/inset según active. */
function SidebarNavSquare({ href, label, icon, active, theme }: { href: string; label: string; icon: React.ReactNode; active: boolean; theme: DashboardTheme }) {
  return (
    <Link
      href={href}
      title={label}
      aria-current={active ? 'page' : undefined}
      className="flex items-center justify-center flex-shrink-0"
      style={{
        width: 46,
        height: 46,
        borderRadius: 13,
        border: 'none',
        cursor: 'pointer',
        background: active ? 'rgba(20,40,212,0.06)' : theme.bg,
        color: active ? '#1428d4' : theme.muted,
        boxShadow: active ? theme.insetSm : theme.elevatedSm,
        transition: 'all 0.18s ease',
        textDecoration: 'none',
      }}
    >
      {icon}
    </Link>
  )
}

function SectionTitle({ children, theme }: { children: React.ReactNode; theme?: DashboardTheme }) {
  const t = theme ?? NM_LIGHT
  return (
    <p style={{ fontSize: f(11), fontWeight: 700, color: t.muted, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 12, fontFamily: "'Space Mono', monospace" }}>
      {children}
    </p>
  )
}

function LessonRow({ lesson, theme, onLessonClick }: { lesson: LessonItem; theme?: DashboardTheme; onLessonClick?: (lessonId: string, lessonTitle: string) => void }) {
  const t = theme ?? NM_LIGHT
  const numStyle: Record<LessonItem['status'], React.CSSProperties> = {
    done:    { background: 'rgba(0,229,160,0.15)', color: '#00b87d', boxShadow: 'inset 2px 2px 4px rgba(0,229,160,0.2), inset -2px -2px 4px rgba(255,255,255,0.8)' },
    current: { background: '#1428d4', color: 'white', boxShadow: '3px 3px 7px rgba(20,40,212,0.4), -2px -2px 5px rgba(255,255,255,0.6)' },
    locked:  { background: 'rgba(136,146,176,0.12)', color: t.muted, boxShadow: t.insetSm },
  }
  return (
    <div
      role={onLessonClick ? 'button' : undefined}
      tabIndex={onLessonClick ? 0 : undefined}
      onClick={onLessonClick ? () => onLessonClick(lesson.id, lesson.title) : undefined}
      onKeyDown={onLessonClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onLessonClick(lesson.id, lesson.title) } } : undefined}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px', borderRadius: 10, marginBottom: 8, cursor: onLessonClick ? 'pointer' : 'default', background: lesson.status === 'current' ? 'rgba(20,40,212,0.04)' : 'transparent', boxShadow: lesson.status === 'current' ? t.insetSm : t.elevatedSm }}
    >
      <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: f(11), fontWeight: 700, fontFamily: "'Space Mono', monospace", flexShrink: 0, ...numStyle[lesson.status] }}>
        {lesson.status === 'done' ? '✓' : lesson.num}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: f(13), fontWeight: 600, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 2 }}>{lesson.title}</p>
        <p style={{ fontSize: f(11), color: t.muted, fontFamily: "'Space Mono', monospace" }}>{lesson.duration} · {lesson.status === 'done' ? 'Completado' : lesson.status === 'current' ? 'En curso' : 'Pendiente'}</p>
      </div>
    </div>
  )
}
