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


interface LessonItem {
  id: string
  num: number
  title: string
  duration: string
  status: 'done' | 'current' | 'locked'
}
/** Para UI: completada | en_curso | pendiente */
function lessonEstado(s: LessonItem['status']): 'completada' | 'en_curso' | 'pendiente' {
  if (s === 'done') return 'completada'
  if (s === 'current') return 'en_curso'
  return 'pendiente'
}

interface LogroItem {
  icon: string
  name: string
  earned: boolean
  bg: string
}

interface ActivityItem {
  tipo: string
  color: string
  title: string
  description: string
  time: string
  puntos?: number
}

interface NotifItem {
  icon: string
  iconBg: string
  title: string
  sub: string
  isNew: boolean
  tipo: string
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

// ─── Íconos neumórficos notificaciones (SVG, sin emojis) ─────────────────
const IconQuiz = () => (
  <div style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, background: '#e8eaf0', boxShadow: '4px 4px 9px #c2c8d6, -4px -4px 9px #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1428d4" strokeWidth="1.8" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
  </div>
)
const IconSesion = () => (
  <div style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, background: '#e8eaf0', boxShadow: '4px 4px 9px #c2c8d6, -4px -4px 9px #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1428d4" strokeWidth="1.8" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
  </div>
)
const IconLogro = () => (
  <div style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, background: '#e8eaf0', boxShadow: '4px 4px 9px #c2c8d6, -4px -4px 9px #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00b87d" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
  </div>
)
const IconTarea = () => (
  <div style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, background: '#e8eaf0', boxShadow: '4px 4px 9px #c2c8d6, -4px -4px 9px #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d84040" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  </div>
)
// Actividad reciente
const IconActQuiz = () => (
  <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: '#e8eaf0', boxShadow: '3px 3px 8px #c2c8d6, -3px -3px 8px #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c89000" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
  </div>
)
const IconActLeccion = () => (
  <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: '#e8eaf0', boxShadow: '3px 3px 8px #c2c8d6, -3px -3px 8px #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1428d4" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  </div>
)
const IconActLogro = () => (
  <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: '#e8eaf0', boxShadow: '3px 3px 8px #c2c8d6, -3px -3px 8px #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00b87d" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  </div>
)
// Logros panel derecho (por nombre)
const LOGROS_ICONOS: Record<string, JSX.Element> = {
  'Cifrado': <svg {...svgAria} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1428d4" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  'Defensor': <svg {...svgAria} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1428d4" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  'Top 10%': <svg {...svgAria} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c89000" strokeWidth="1.8" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  'Experto': <svg {...svgAria} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8892b0" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
  'Red Gov': <svg {...svgAria} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8892b0" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  'Graduado': <svg {...svgAria} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8892b0" strokeWidth="1.8" strokeLinecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
}

// ─── Navegación franja izquierda (cuadrados neumórficos) ───────────────────────
const IcoPortfolio = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
const IcoKnowledge = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/><path d="M12 5a7 7 0 0 0-7 7c0 2.5 1.5 4 3 5l4-4 4 4c1.5-1 3-2.5 3-5a7 7 0 0 0-7-7z"/></svg>
const IcoRetos = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
const NAV_ITEMS: { href: string; label: string; tooltip: string; icon: React.ReactNode }[] = [
  { href: '/inicio', label: 'Inicio', tooltip: 'Dashboard', icon: <IcoGrid /> },
  { href: '/curso', label: 'Mi Curso', tooltip: 'Mi curso', icon: <IcoBook /> },
  { href: '/sesiones-en-vivo', label: 'Sesiones', tooltip: 'Sesiones en vivo', icon: <IcoCalendar /> },
  { href: '/tareas', label: 'Tareas', tooltip: 'Tareas', icon: <IcoCheck /> },
  { href: '/comunidad', label: 'Comunidad', tooltip: 'Comunidad', icon: <IcoUsers /> },
  { href: '/mi-colega', label: 'Mi Colega', tooltip: 'Mi colega', icon: <IcoMsg /> },
  { href: '/laboratorio', label: 'Laboratorio', tooltip: 'El Laboratorio', icon: <IcoLab /> },
  { href: '/portafolio', label: 'Portafolio', tooltip: 'Portafolio', icon: <IcoPortfolio /> },
  { href: '/conocimiento', label: 'Conocimiento', tooltip: 'Conocimiento', icon: <IcoKnowledge /> },
  { href: '/retos', label: 'Retos', tooltip: 'Retos', icon: <IcoRetos /> },
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
  { tipo: 'quiz',   color: '#c89000', title: 'Quiz completado',    description: 'Módulo 2: 92/100 puntos',  time: 'Hace 2h', puntos: 92 },
  { tipo: 'lesson', color: '#1428d4', title: 'Lección terminada',  description: 'Cifrado E2E y protocolos', time: 'Ayer' },
  { tipo: 'logro',  color: '#00b87d', title: 'Logro desbloqueado', description: 'Defensor Digital',         time: 'Lun' },
]

const NOTIFS: (NotifItem & { href: string })[] = [
  { icon: '📋', iconBg: 'rgba(0,229,160,0.15)',   title: 'Quiz disponible',    sub: 'Módulo 3 · Hoy 16:00',      isNew: true,  href: '/curso#quiz',    tipo: 'quiz' },
  { icon: '🎙️', iconBg: 'rgba(20,40,212,0.12)',   title: 'Sesión en vivo',     sub: 'Mañana 10:00 AM',            isNew: true,  href: '/sesiones-en-vivo', tipo: 'sesion' },
  { icon: '⭐',  iconBg: 'rgba(255,186,0,0.14)',   title: 'Logro cerca',        sub: 'Completa 1 lección más',     isNew: false, href: '/mi-perfil#logros', tipo: 'logro' },
  { icon: '📝',  iconBg: 'rgba(229,57,53,0.1)',    title: 'Tarea pendiente',    sub: 'Vence el 18 Mar',            isNew: true,  href: '/curso#tareas',  tipo: 'tarea' },
]

// Días con evento en el calendario (ej. entrega, sesión)
const CAL_EVENTS = [10, 15, 18, 22, 25]

const ESTADOS = [
  { id: 'bien', label: 'Bien', color: '#00b87d', bg: 'rgba(0,184,125,0.12)', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg> },
  { id: 'regular', label: 'Regular', color: '#c89000', bg: 'rgba(200,144,0,0.12)', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg> },
  { id: 'dificil', label: 'Difícil', color: '#d84040', bg: 'rgba(216,64,64,0.12)', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg> },
  { id: 'excelente', label: 'Excelente', color: '#1428d4', bg: 'rgba(20,40,212,0.12)', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 3 4 3 4-3 4-3"/><path d="M9 9l.01 0"/><path d="M15 9l.01 0"/><path d="M9 9 Q10 7 12 8 Q14 7 15 9"/></svg> },
] as const

function getPrioridad(tipo: string) {
  if (tipo === 'tarea' || tipo === 'quiz') return { color: '#d84040', bg: 'rgba(216,64,64,0.12)', dot: '#d84040' }
  if (tipo === 'sesion') return { color: '#1428d4', bg: 'rgba(20,40,212,0.08)', dot: '#1428d4' }
  if (tipo === 'logro') return { color: '#00b87d', bg: 'rgba(0,184,125,0.1)', dot: '#00e5a0' }
  return { color: '#8892b0', bg: 'transparent', dot: '#00e5a0' }
}

const TIPO_CONFIG: Record<string, { color: string; emoji: string }> = {
  quiz:   { color: '#c89000', emoji: '🎯' },
  lesson: { color: '#1428d4', emoji: '📖' },
  logro:  { color: '#00b87d', emoji: '⭐' },
  tarea:  { color: '#d84040', emoji: '📝' },
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function DashboardAlumno() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'
  const NM = isDark ? NM_DARK : NM_LIGHT
  const [selectedMood, setSelectedMood] = useState<MoodValue>(null)
  const [checkinSelected, setCheckinSelected] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  const handleCerrarSesion = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    router.push('/login')
    router.refresh()
  }
  const [nota, setNota] = useState('')
  const [notaGuardada, setNotaGuardada] = useState(false)
  const [notaLoading, setNotaLoading] = useState(false)

  useEffect(() => {
    fetch('/api/notas/inicio', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { text?: string } | null) => {
        if (d?.text != null) setNota(d.text)
      })
      .catch(() => {})
  }, [])

  const handleGuardarNota = () => {
    const text = nota.trim()
    if (!text) return
    setNotaLoading(true)
    fetch('/api/notas/inicio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ text }),
    })
      .then((r) => r.ok)
      .then((ok) => {
        if (ok) {
          setNotaGuardada(true)
          setTimeout(() => setNotaGuardada(false), 2000)
        }
      })
      .finally(() => setNotaLoading(false))
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

  const [today, setToday] = useState<Date>(() => new Date())
  useEffect(() => {
    setToday(new Date())
    const id = setInterval(() => setToday(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const dateDesktop = today.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).replace(/\./g, '').replace(/\b\w/g, (c) => c.toUpperCase())
  const dateMobile = today.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }).replace(/\./g, '').replace(/\b\w/g, (c) => c.toUpperCase())
  const calYear = today.getFullYear()
  const calMonth = today.getMonth()
  const calFirstDay = new Date(calYear, calMonth, 1).getDay()
  const calDaysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const calTodayDate = today.getDate()
  const calMonthLabel = today.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }).replace(/\b\w/g, (c) => c.toUpperCase())

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
      style={{ background: NM.bg, fontFamily: "var(--font-heading)", color: NM.text }}
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
            boxShadow: '5px 5px 12px rgba(10,15,138,0.4), -3px -3px 8px rgba(255,255,255,0.5)',
          }}
          aria-hidden
        >
          <IcoLayers />
        </div>
        <nav className="flex flex-col gap-2 items-center w-full" role="navigation">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== '/inicio' && pathname?.startsWith(item.href))
            return (
              <div key={item.href} style={{ position: 'relative' }} onMouseEnter={() => setHovered(item.href)} onMouseLeave={() => setHovered(null)}>
                <SidebarNavSquare href={item.href} label={item.label} icon={item.icon} active={active} theme={NM} />
                {hovered === item.href && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 58,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: '#e8eaf0',
                      borderRadius: 10,
                      padding: '6px 12px',
                      boxShadow: '5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff',
                      whiteSpace: 'nowrap',
                      zIndex: 100,
                      fontFamily: "var(--font-heading)",
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#0a0f8a',
                      pointerEvents: 'none',
                    }}
                  >
                    {item.tooltip}
                    <div
                      style={{
                        position: 'absolute',
                        left: -6,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 0,
                        height: 0,
                        borderTop: '5px solid transparent',
                        borderBottom: '5px solid transparent',
                        borderRight: '6px solid #e8eaf0',
                        filter: 'drop-shadow(-2px 0 2px #c2c8d6)',
                      }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </nav>
        <div className="flex-1" />
        <div className="flex flex-col gap-2 w-full items-center">
          <div style={{ position: 'relative' }} onMouseEnter={() => setHovered('perfil')} onMouseLeave={() => setHovered(null)}>
            <SidebarNavSquare href="/mi-perfil" label="Mi perfil" icon={<IcoUser />} active={pathname === '/mi-perfil' || pathname?.startsWith('/mi-perfil')} theme={NM} />
            {hovered === 'perfil' && (
              <div style={{ position: 'absolute', left: 58, top: '50%', transform: 'translateY(-50%)', background: '#e8eaf0', borderRadius: 10, padding: '6px 12px', boxShadow: '5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff', whiteSpace: 'nowrap', zIndex: 100, fontFamily: "var(--font-heading)", fontSize: 12, fontWeight: 600, color: '#0a0f8a', pointerEvents: 'none' }}>
                Mi perfil
                <div style={{ position: 'absolute', left: -6, top: '50%', transform: 'translateY(-50%)', width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderRight: '6px solid #e8eaf0', filter: 'drop-shadow(-2px 0 2px #c2c8d6)' }} />
              </div>
            )}
          </div>
          <div style={{ position: 'relative' }} onMouseEnter={() => setHovered('logout')} onMouseLeave={() => setHovered(null)}>
            <button
              type="button"
              onClick={handleCerrarSesion}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 46, height: 46, borderRadius: 13,
                border: 'none', cursor: 'pointer',
                background: '#e8eaf0', color: NM.muted,
                boxShadow: '4px 4px 9px #c2c8d6, -4px -4px 9px #ffffff',
                transition: 'all 0.18s ease',
              }}
            >
              <IcoLogout />
            </button>
            {hovered === 'logout' && (
              <div style={{ position: 'absolute', left: 58, top: '50%', transform: 'translateY(-50%)', background: '#e8eaf0', borderRadius: 10, padding: '6px 12px', boxShadow: '5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff', whiteSpace: 'nowrap', zIndex: 100, fontFamily: "var(--font-heading)", fontSize: 12, fontWeight: 600, color: '#0a0f8a', pointerEvents: 'none' }}>
                Cerrar sesión
                <div style={{ position: 'absolute', left: -6, top: '50%', transform: 'translateY(-50%)', width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderRight: '6px solid #e8eaf0', filter: 'drop-shadow(-2px 0 2px #c2c8d6)' }} />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <main
        className="main-content flex-1 overflow-y-auto min-w-0"
        style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}
        role="main"
        aria-label="Dashboard del alumno"
      >
        {/* Top bar */}
        <div className="flex items-start justify-between" style={{ marginBottom: 28 }}>
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
                fontFamily: "var(--font-heading)", fontSize: f(10), fontWeight: 700,
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
                fontFamily: "var(--font-heading)", fontSize: f(10), fontWeight: 700,
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
              {dateDesktop}
            </span>
            <span className="topbar-date-mobile" style={{ background: NM.bg, borderRadius: 10, padding: '6px 11px', boxShadow: NM.insetSm, fontSize: f(10), color: NM.muted2, fontFamily: "'Space Mono', monospace" }}>
              {dateMobile}
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
          className="flex items-center gap-2"
          style={{ background: NM.bg, borderRadius: 11, padding: '8px 13px', boxShadow: NM.inset, marginBottom: 20 }}
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
          aria-label="Bienvenida y progreso"
          style={{
            background: 'linear-gradient(135deg, #0a0f8a, #1428d4)',
            borderRadius: 20,
            padding: '32px 36px',
            marginBottom: 20,
            boxShadow: '7px 7px 18px rgba(10,15,138,0.35), -4px -4px 12px rgba(255,255,255,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            minHeight: 220,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {(() => {
            const progreso = dashboardProgress && dashboardProgress.lessonsTotal > 0
              ? Math.round((dashboardProgress.lessonsDone / dashboardProgress.lessonsTotal) * 100)
              : 68
            const proximaLeccionId = LESSONS.find((l) => l.status === 'current')?.id ?? 'mod3-leccion-2'
            const diasRestantes = completionPrediction
              ? Math.ceil((new Date(completionPrediction.date).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
              : 14
            const nombreAlumno = 'María Antonia Flores'
            const cursoTitulo = 'Ciberseguridad para Gobierno Digital · La innovación no es un destino, es una forma de caminar.'
            const continuarLabel = 'Continuar con la lección: ' + (LESSONS.find((l) => l.status === 'current')?.title ?? 'siguiente')
            return (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, width: '100%', minWidth: 0 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 8 }}>
                    Buenas tardes
                  </p>
                  <h2 style={{ fontSize: 26, fontWeight: 800, color: 'white', fontFamily: "var(--font-heading)", letterSpacing: '-0.5px', marginBottom: 6 }}>
                    {nombreAlumno}
                  </h2>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontFamily: "var(--font-body)", marginBottom: 20, lineHeight: 1.5 }}>
                    {cursoTitulo}
                  </p>
                  <div style={{ marginBottom: 20 }} role="progressbar" aria-valuenow={progreso} aria-valuemin={0} aria-valuemax={100} aria-label={'Progreso del curso: ' + progreso + '%'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: "'Space Mono', monospace" }}>Progreso del curso</span>
                      <span style={{ fontSize: 12, color: '#00e5a0', fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{progreso}%</span>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: progreso + '%', background: 'linear-gradient(90deg, #00e5a0, #00c98a)', borderRadius: 4, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      type="button"
                      onClick={() => router.push('/curso/lecciones/' + proximaLeccionId)}
                      aria-label={continuarLabel}
                      style={{
                        padding: '11px 24px', borderRadius: 50, border: 'none', cursor: 'pointer', background: 'white', color: '#0a0f8a',
                        fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)', whiteSpace: 'nowrap',
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#0a0f8a"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      Continuar
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push('/curso')}
                      aria-label="Ver programa del curso"
                      style={{
                        padding: '11px 24px', borderRadius: 50, border: '1.5px solid rgba(255,255,255,0.5)', cursor: 'pointer', background: 'transparent', color: 'white',
                        fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap',
                      }}
                    >
                      Ver programa
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <svg width="90" height="90" viewBox="0 0 90 90" aria-hidden>
                    <circle cx="45" cy="45" r="36" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="7" />
                    <circle cx="45" cy="45" r="36" fill="none" stroke="#00e5a0" strokeWidth="7" strokeLinecap="round" strokeDasharray={2 * Math.PI * 36} strokeDashoffset={2 * Math.PI * 36 * (1 - progreso / 100)} transform="rotate(-90 45 45)" style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
                    <text x="45" y="41" textAnchor="middle" fill="white" fontSize="18" fontWeight="800" fontFamily="Space Mono, monospace">{progreso}%</text>
                    <text x="45" y="55" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="9" fontFamily="Raleway, sans-serif">progreso</text>
                  </svg>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: "'Space Mono', monospace", textAlign: 'center', lineHeight: 1.4 }}>
                    {diasRestantes} días<br />restantes
                  </p>
                </div>
              </div>
            )
          })()}
        </section>

        {/* Check-in */}
        <section style={{ background: NM.bg, borderRadius: 16, padding: 24, boxShadow: NM.elevated }} aria-label="Check-in de bienestar">
          <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
            <legend className="sr-only">¿Cómo llegaste hoy?</legend>
            <p style={{ fontSize: 12, fontWeight: 700, color: NM.muted, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 12, fontFamily: "'Space Mono', monospace" }}>
              Check-in · ¿Cómo llegaste hoy?
            </p>
            <div className="checkin-grid flex gap-2" role="radiogroup" aria-label="Estado de ánimo">
              {ESTADOS.map((estado) => (
                <button
                  key={estado.id}
                  type="button"
                  role="radio"
                  aria-checked={checkinSelected === estado.id}
                  aria-label={estado.label}
                  onClick={() => {
                    setCheckinSelected(estado.id)
                    setSelectedMood(estado.id as MoodValue)
                    fetch('/api/checkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ mood: estado.id }) }).catch(() => {})
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCheckinSelected(estado.id); setSelectedMood(estado.id as MoodValue) } }}
                  style={{
                    flex: 1,
                    padding: '20px 8px',
                    borderRadius: 18,
                    border: checkinSelected === estado.id ? `2px solid ${estado.color}` : '2px solid transparent',
                    cursor: 'pointer',
                    background: '#e8eaf0',
                    color: checkinSelected === estado.id ? estado.color : '#4a5580',
                    boxShadow: checkinSelected === estado.id
                      ? 'inset 4px 4px 10px #c2c8d6, inset -4px -4px 10px #ffffff'
                      : '5px 5px 13px #c2c8d6, -5px -5px 13px #ffffff',
                    opacity: checkinSelected !== null && checkinSelected !== estado.id ? 0.5 : 1,
                    transform: checkinSelected === estado.id ? 'scale(0.97)' : 'scale(1)',
                    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    fontFamily: "var(--font-heading)",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  <span style={{ color: checkinSelected === estado.id ? estado.color : '#4a5580' }}>
                    {estado.icon}
                  </span>
                  {estado.label}
                </button>
              ))}
            </div>
          </fieldset>
          {checkinSelected && (
            <div
              style={{
                marginTop: 12,
                padding: '10px 16px',
                borderRadius: 12,
                background: NM.bg,
                boxShadow: 'inset 2px 2px 6px #c2c8d6, inset -2px -2px 6px #ffffff',
                textAlign: 'center',
                animation: 'fadeIn 0.3s ease',
              }}
            >
              <p style={{ fontSize: 12, color: '#4a5580', fontFamily: "var(--font-heading)" }}>
                ✓ Check-in registrado. ¡Gracias!
              </p>
            </div>
          )}
          <div aria-live="polite" aria-atomic className="sr-only">
            {checkinSelected ? `Seleccionaste: ${ESTADOS.find(e => e.id === checkinSelected)?.label ?? checkinSelected}` : ''}
          </div>
        </section>

        {/* Lecciones + Notificaciones */}
        <div className="lessons-notifs-grid grid grid-cols-2 gap-3">
          {/* Lecciones */}
          <section style={{ background: NM.bg, borderRadius: 16, padding: 24, boxShadow: NM.elevated }} aria-labelledby="lecciones-heading">
            <h3 id="lecciones-heading" style={{ fontSize: 13, fontWeight: 700, color: NM.muted, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 12, fontFamily: "'Space Mono', monospace" }}>
              Módulo 3 · Lecciones
            </h3>
            {LESSONS.map((leccion, i) => {
              const estado = lessonEstado(leccion.status)
              const primeraPendiente = LESSONS.findIndex((l) => l.status === 'current') >= 0 ? LESSONS.findIndex((l) => l.status === 'current') : LESSONS.findIndex((l) => l.status === 'locked')
              const estaActiva = estado === 'en_curso' || (estado === 'pendiente' && i === primeraPendiente)
              const estaCompleta = estado === 'completada'
              return (
                <div
                  key={leccion.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => leccion.status !== 'locked' && handleOpenLesson(leccion.id, leccion.title)}
                  onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && leccion.status !== 'locked') { e.preventDefault(); handleOpenLesson(leccion.id, leccion.title) } }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 14,
                    marginBottom: 8,
                    cursor: leccion.status !== 'locked' ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                    background: NM.bg,
                    borderLeft: estaActiva ? '3px solid #1428d4' : estaCompleta ? '3px solid #00e5a0' : '3px solid transparent',
                    boxShadow: estaActiva ? '5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff' : estaCompleta ? 'inset 2px 2px 6px #c2c8d6, inset -2px -2px 6px #ffffff' : '3px 3px 8px #c2c8d6, -3px -3px 8px #ffffff',
                    opacity: estaCompleta ? 0.7 : 1,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      flexShrink: 0,
                      background: estaActiva ? 'rgba(20,40,212,0.12)' : estaCompleta ? 'rgba(0,229,160,0.15)' : NM.bg,
                      boxShadow: !estaActiva && !estaCompleta ? '3px 3px 7px #c2c8d6, -3px -3px 7px #ffffff' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {estaActiva && (
                      <div
                        style={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          border: '2px solid #1428d4',
                          animation: 'pulse-ring 1.5s ease-in-out infinite',
                        }}
                        aria-hidden
                      />
                    )}
                    {estaCompleta ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00b87d" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : estaActiva ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1428d4" strokeWidth="2">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    ) : (
                      <span style={{ fontSize: 11, fontWeight: 700, color: NM.muted, fontFamily: "'Space Mono', monospace" }}>{i + 1}</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: estaActiva ? 700 : 600, color: estaActiva ? NM.text : estaCompleta ? NM.muted : NM.muted2 }}>
                      {leccion.title}
                    </p>
                    <p style={{ fontSize: 13, color: NM.muted, marginTop: 2, fontFamily: "'Space Mono', monospace" }}>
                      {leccion.duration} · <span style={{ color: estaActiva ? '#1428d4' : estaCompleta ? '#00b87d' : NM.muted, marginLeft: 4 }}>{estaCompleta ? 'Completada' : estaActiva ? 'En curso' : 'Pendiente'}</span>
                    </p>
                  </div>
                  {estaActiva && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#1428d4', fontFamily: "'Space Mono', monospace", background: 'rgba(20,40,212,0.08)', padding: '2px 8px', borderRadius: 20 }}>
                      Siguiente →
                    </span>
                  )}
                </div>
              )
            })}
          </section>
          {/* Notificaciones */}
          <section style={{ background: NM.bg, borderRadius: 16, padding: 24, boxShadow: NM.elevated }} aria-labelledby="notificaciones-heading">
            <div className="flex items-center justify-between mb-3">
              <h3 id="notificaciones-heading" style={{ fontSize: 13, fontWeight: 700, color: NM.muted, textTransform: 'uppercase', letterSpacing: '2px', fontFamily: "'Space Mono', monospace", margin: 0 }}>
                Notificaciones
              </h3>
              <Link href="/pendientes" style={{ fontSize: f(10), fontWeight: 600, color: '#1428d4', fontFamily: "var(--font-heading)", textDecoration: 'none' }}>Ver todos</Link>
            </div>
            {NOTIFS.map((notif, i) => {
              const prioridad = getPrioridad(notif.tipo)
              return (
                <div
                  key={i}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(notif.href)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(notif.href) } }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '11px 14px',
                    borderRadius: 12,
                    marginBottom: 6,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    background: NM.bg,
                    boxShadow: '4px 4px 9px #c2c8d6, -4px -4px 9px #ffffff',
                    borderLeft: `3px solid ${prioridad.color}`,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff' }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '4px 4px 9px #c2c8d6, -4px -4px 9px #ffffff' }}
                >
                  <div>
                    {notif.tipo === 'quiz' && <IconQuiz />}
                    {notif.tipo === 'sesion' && <IconSesion />}
                    {notif.tipo === 'logro' && <IconLogro />}
                    {notif.tipo === 'tarea' && <IconTarea />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: NM.text }}>{notif.title}</p>
                    <p style={{ fontSize: 13, color: NM.muted, marginTop: 2, fontFamily: "'Space Mono', monospace" }}>{notif.sub}</p>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: prioridad.dot, boxShadow: `0 0 0 3px ${prioridad.dot}33` }} />
                </div>
              )
            })}
          </section>
        </div>

        {/* Actividad reciente — línea de tiempo */}
        <section style={{ background: NM.bg, borderRadius: 18, padding: 24, boxShadow: NM.elevated }} aria-labelledby="actividad-heading">
          <p id="actividad-heading" style={{ fontSize: 12, fontWeight: 700, color: NM.muted, textTransform: 'uppercase', letterSpacing: '2px', fontFamily: "'Space Mono', monospace", marginBottom: 20 }}>
            Actividad reciente
          </p>
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                left: 15,
                top: 8,
                bottom: 8,
                width: 2,
                background: NM.bg,
                boxShadow: 'inset 1px 1px 3px #c2c8d6, inset -1px -1px 3px #ffffff',
              }}
              aria-hidden
            />
            {ACTIVITY.map((act, i) => {
              const cfg = TIPO_CONFIG[act.tipo] ?? { color: NM.muted }
              const ActIcon = act.tipo === 'quiz' ? IconActQuiz : act.tipo === 'lesson' ? IconActLeccion : IconActLogro
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    marginBottom: 16,
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(3px)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(0)' }}
                >
                  <ActIcon />
                  <div style={{ flex: 1, paddingTop: 2 }}>
                    <p style={{ fontSize: 14, color: NM.text, fontWeight: 600 }}>
                      <span style={{ color: cfg.color }}>{act.title}</span>
                      {' — '}{act.description}
                    </p>
                    <p style={{ fontSize: 10, color: NM.muted, marginTop: 3, fontFamily: "'Space Mono', monospace" }}>
                      {act.time}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <div style={{ marginTop: 8, marginBottom: 8 }}>
          <button
            type="button"
            onClick={() => router.push('/curso/lecciones/' + (LESSONS.find((l) => l.status === 'current')?.id ?? 'mod3-leccion-2'))}
            aria-label={'Continuar con la lección: ' + (LESSONS.find((l) => l.status === 'current')?.title ?? 'siguiente')}
            style={{
              width: '100%',
              padding: 16,
              borderRadius: 16,
              border: 'none',
              cursor: 'pointer',
              fontFamily: "var(--font-heading)",
              fontSize: 15,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #1428d4, #0a0f8a)',
              color: 'white',
              boxShadow: '5px 5px 14px rgba(10,15,138,0.4), -3px -3px 9px rgba(255,255,255,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Continuar — {LESSONS.find((l) => l.status === 'current')?.title ?? 'siguiente lección'}
          </button>
        </div>
        <button
          type="button"
          className="w-full"
          aria-label="Ir al Laboratorio de Simulación"
          style={{ padding: 12, minHeight: 44, borderRadius: 13, border: 'none', cursor: 'pointer', fontFamily: "var(--font-heading)", fontSize: f(13), fontWeight: 600, background: NM.bg, color: '#1428d4', boxShadow: NM.elevatedSm }}
        >
          Ir al Laboratorio de Simulación
        </button>
      </main>

      {/* ── PANEL DERECHO (cards separadas, 340px) ─────────────────────── */}
      <aside
        className={`panel-right flex-shrink-0 overflow-y-auto ${showRightPanel ? 'open' : ''}`}
        style={{
          width: 340,
          minWidth: 340,
          background: '#e8eaf0',
          boxShadow: '-5px 0 18px #c2c8d6, -1px 0 4px #ffffff',
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          overflowY: 'auto',
        }}
        role="complementary"
        aria-label="Información del alumno"
      >
        {/* CARD 1: Perfil */}
        <div
          style={{
            background: NM.bg,
            borderRadius: 18,
            padding: '18px 14px',
            boxShadow: '5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
          aria-labelledby="perfil-stats-heading"
        >
          <div role="img" aria-label="Avatar de María A. Flores" style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #1428d4, #0a0f8a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: 'white', marginBottom: 10, boxShadow: NM.elevatedSm }}>
            MA
          </div>
          <p style={{ fontSize: 18, fontWeight: 800, color: NM.text, marginBottom: 10, fontFamily: "var(--font-heading)" }}>María A. Flores</p>
          <h3 id="perfil-stats-heading" className="sr-only">Estadísticas del curso</h3>
          <dl className="grid grid-cols-2 gap-2 w-full" style={{ margin: 0 }}>
            {[['68%','Progreso'],['5','Logros'],['8.7','Calific.'],['7d','Racha']].map(([val,lbl],i) => (
              <div key={i} style={{ background: '#e8eaf0', borderRadius: 10, padding: '10px 8px', boxShadow: NM.insetSm, textAlign: 'center' }}>
                <dt style={{ fontSize: 11, color: NM.muted, textTransform: 'uppercase', letterSpacing: '0.4px', margin: 0 }}>{lbl}</dt>
                <dd style={{ fontSize: 22, fontWeight: 800, color: NM.text, fontFamily: "'Space Mono', monospace", lineHeight: 1, marginBottom: 0, marginTop: 2 }}>{val}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* CARD 2: Mis Notas */}
        <div
          style={{
            background: NM.bg,
            borderRadius: 18,
            padding: '16px 14px',
            boxShadow: '5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff',
          }}
        >
          <p style={{ fontSize: 10, fontWeight: 700, color: NM.muted, textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: "'Space Mono', monospace", marginBottom: 10 }}>
            Mis notas
          </p>
          <p style={{ fontSize: 9, color: '#b0b8c8', marginBottom: 8 }}>Solo tú puedes ver tus notas</p>
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Escribe aquí tus notas y guárdalas."
            aria-label="Campo de notas personales"
            style={{
              width: '100%',
              border: 'none',
              background: NM.bg,
              borderRadius: 10,
              padding: 12,
              fontFamily: "var(--font-heading)",
              fontSize: f(13),
              color: NM.muted2,
              resize: 'none',
              outline: 'none',
              boxShadow: NM.inset,
              lineHeight: 1.5,
              minHeight: 90,
            }}
          />
          <button
            type="button"
            onClick={handleGuardarNota}
            disabled={notaLoading}
            aria-label={notaGuardada ? 'Nota guardada' : 'Guardar nota'}
            style={{
              width: '100%',
              marginTop: 8,
              padding: '10px',
              minHeight: 44,
              borderRadius: 9,
              border: 'none',
              cursor: notaLoading ? 'wait' : 'pointer',
              fontFamily: "var(--font-heading)",
              fontSize: f(12),
              fontWeight: 700,
              background: NM.bg,
              color: notaGuardada ? '#00b87d' : '#1428d4',
              boxShadow: NM.elevatedSm,
            }}
          >
            {notaLoading ? 'Guardando…' : notaGuardada ? '✓ Guardado' : 'Guardar nota'}
          </button>
          <div aria-live="polite" aria-atomic className="sr-only">
            {notaGuardada ? 'Nota guardada exitosamente' : ''}
          </div>
        </div>

        {/* CARD 3: Mis Logros */}
        <div
          style={{
            background: NM.bg,
            borderRadius: 18,
            padding: '16px 14px',
            boxShadow: '5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff',
          }}
          aria-labelledby="logros-heading"
        >
          <p id="logros-heading" style={{ fontSize: 12, fontWeight: 700, color: NM.muted, textTransform: 'uppercase', letterSpacing: '2px', fontFamily: "'Space Mono', monospace", marginBottom: 12 }}>
            Mis logros
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {LOGROS.map((logro, i) => (
              <div
                key={i}
                style={{
                  background: '#e8eaf0',
                  borderRadius: 14,
                  padding: '12px 8px',
                  boxShadow: logro.earned ? '4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff' : 'inset 2px 2px 6px #c2c8d6, inset -2px -2px 6px #ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  opacity: logro.earned ? 1 : 0.4,
                  cursor: logro.earned ? 'pointer' : 'default',
                }}
              >
                {LOGROS_ICONOS[logro.name]}
                <p style={{ fontSize: 9, fontWeight: 700, color: '#0a0f8a', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', lineHeight: 1.2, fontFamily: "var(--font-heading)" }}>{logro.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CARD 4: Calendario */}
        <div style={{ background: NM.bg, borderRadius: 18, padding: '16px 14px', boxShadow: '5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff', maxWidth: 200 }}>
          <div className="flex justify-between items-center mb-1">
            <span style={{ fontSize: f(11), fontWeight: 700, color: NM.text }}>{calMonthLabel}</span>
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
            {Array.from({ length: calFirstDay }).map((_,i) => (
              <div key={`e-${i}`} style={{ aspectRatio: '1', minWidth: 0 }} />
            ))}
            {Array.from({ length: calDaysInMonth }).map((_,i) => {
              const day = i + 1
              const isToday = day === calTodayDate
              const hasEvent = CAL_EVENTS.includes(day) && !isToday
              return (
                <div
                  key={day}
                  role="button"
                  tabIndex={0}
                  aria-label={isToday ? `Hoy, ${day}` : `Día ${day}`}
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
            cursor: 'pointer', fontFamily: "var(--font-heading)",
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
        background: active ? 'rgba(20,40,212,0.06)' : '#e8eaf0',
        color: active ? '#1428d4' : theme.muted,
        boxShadow: active ? theme.insetSm : '4px 4px 9px #c2c8d6, -4px -4px 9px #ffffff',
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

