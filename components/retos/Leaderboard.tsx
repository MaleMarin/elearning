'use client'

import type { LeaderboardEntry } from '@/app/api/retos/leaderboard/route'

interface LeaderboardProps {
  entries: LeaderboardEntry[]
}

function PosIcon({ pos }: { pos: number }) {
  if (pos === 1) return <span style={{ color: '#f59e0b' }}>🥇</span>
  if (pos === 2) return <span style={{ color: '#94a3b8' }}>🥈</span>
  if (pos === 3) return <span style={{ color: '#b45309' }}>🥉</span>
  return <span style={{ fontSize: 14, fontWeight: 700, color: '#4a5580', minWidth: 20 }}>{pos}</span>
}

export default function Leaderboard({ entries }: LeaderboardProps) {
  return (
    <div
      role="table"
      aria-label="Tabla de posiciones del grupo"
      style={{
        background: '#e8eaf0',
        borderRadius: 16,
        padding: 20,
        boxShadow: '6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff',
        fontFamily: "'Syne', sans-serif",
        overflowX: 'auto',
      }}
    >
      <div role="row" style={{ display: 'grid', gridTemplateColumns: '60px 1fr 100px 80px', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(194,200,214,0.5)', fontSize: 11, fontWeight: 700, color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        <div role="columnheader">Posición</div>
        <div role="columnheader">Alumno</div>
        <div role="columnheader">Puntos</div>
        <div role="columnheader">Retos</div>
      </div>
      {entries.map((e) => (
        <div
          key={e.pos}
          role="row"
          style={{
            display: 'grid',
            gridTemplateColumns: '60px 1fr 100px 80px',
            gap: 12,
            padding: '12px 0',
            alignItems: 'center',
            borderBottom: e.pos < entries.length ? '1px solid rgba(194,200,214,0.3)' : 'none',
            background: e.esYo ? 'rgba(20,40,212,0.08)' : 'transparent',
            borderRadius: 10,
            margin: '0 -4px',
            paddingLeft: 4,
            paddingRight: 4,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <PosIcon pos={e.pos} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0a0f8a' }}>
            {e.nombre}
            {e.esYo && <span style={{ marginLeft: 6, fontSize: 11, color: '#1428d4', fontWeight: 500 }}>(tú)</span>}
          </div>
          <div style={{ fontSize: 14, fontFamily: "'Space Mono', monospace", fontWeight: 600, color: '#4a5580' }}>
            {e.puntos.toLocaleString('es-MX')}
          </div>
          <div style={{ fontSize: 13, color: '#4a5580' }}>
            {e.retos}/{e.total}
          </div>
        </div>
      ))}
    </div>
  )
}
