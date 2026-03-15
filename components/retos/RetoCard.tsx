'use client'

import type { RetoActivo } from '@/app/api/retos/route'

function diasBadgeColor(dias: number): string {
  if (dias >= 5) return '#00e5a0'
  if (dias >= 2) return '#ffc107'
  return '#e53935'
}

const svgAria = { 'aria-hidden': true, focusable: false }
const IcoTrophy = () => <svg {...svgAria} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
const IcoUsers = () => <svg {...svgAria} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const IcoStar = () => <svg {...svgAria} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>

interface RetoCardProps {
  reto: RetoActivo
  onParticipar: (id: string) => void
  onVerDetalles: (id: string) => void
}

export default function RetoCard({ reto, onParticipar, onVerDetalles }: RetoCardProps) {
  const badgeColor = diasBadgeColor(reto.diasRestantes)
  const diasLabel = reto.diasRestantes === 1 ? '1 día' : `${reto.diasRestantes} días`

  return (
    <div
      style={{
        background: '#e8eaf0',
        borderRadius: 16,
        padding: 20,
        boxShadow: '6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff',
        fontFamily: "'Syne', sans-serif",
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#0a0f8a', fontFamily: "'Space Mono', monospace" }}>
          <IcoTrophy />
          RETO SEMANAL
        </span>
        <span
          style={{
            background: badgeColor,
            color: badgeColor === '#00e5a0' || badgeColor === '#e53935' ? '#0a0f8a' : '#0a0f8a',
            padding: '4px 10px',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 600,
            boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          Vence en {diasLabel}
        </span>
      </div>
      <h3 style={{ margin: '0 0 10px 0', fontSize: 16, fontWeight: 700, color: '#0a0f8a', lineHeight: 1.3 }}>
        {reto.titulo}
      </h3>
      <p style={{ margin: '0 0 14px 0', fontSize: 13, color: '#4a5580', lineHeight: 1.5 }}>
        "{reto.descripcion}"
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, fontSize: 12, color: '#4a5580' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <IcoUsers />
          {reto.participantes} participantes del grupo
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <IcoStar />
          {reto.puntos} puntos al completar
        </span>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => onParticipar(reto.id)}
          style={{
            padding: '10px 18px',
            borderRadius: 50,
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Syne', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            background: 'linear-gradient(135deg, #1428d4, #2b4fff)',
            color: '#fff',
            boxShadow: '4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff',
          }}
        >
          Participar
        </button>
        <button
          type="button"
          onClick={() => onVerDetalles(reto.id)}
          style={{
            padding: '10px 18px',
            borderRadius: 50,
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Syne', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            background: '#e8eaf0',
            color: '#4a5580',
            boxShadow: '4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff',
          }}
        >
          Ver detalles
        </button>
      </div>
    </div>
  )
}
