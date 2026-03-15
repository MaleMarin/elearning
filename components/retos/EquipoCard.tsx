'use client'

interface Miembro {
  nombre: string
  progreso: number
}

interface EquipoCardProps {
  tieneEquipo: boolean
  nombreEquipo?: string
  miembros?: Miembro[]
  puntuacionTotal?: number
  proximoReto?: string
  onVerEquipos?: () => void
  onCreateEquipo?: () => void
}

const svgAria = { 'aria-hidden': true, focusable: false }
const IcoUsers = () => <svg {...svgAria} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>

export default function EquipoCard({
  tieneEquipo,
  nombreEquipo = 'Equipo Alpha',
  miembros = [
    { nombre: 'María A. Flores', progreso: 85 },
    { nombre: 'Carlos R. Méndez', progreso: 70 },
    { nombre: 'Ana L. Torres', progreso: 60 },
  ],
  puntuacionTotal = 2450,
  proximoReto = 'Mapa de riesgos institucional',
  onVerEquipos,
  onCreateEquipo,
}: EquipoCardProps) {
  const cardStyle = {
    background: '#e8eaf0',
    borderRadius: 16,
    padding: 20,
    boxShadow: '6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff',
    fontFamily: "'Syne', sans-serif",
  }

  if (!tieneEquipo) {
    return (
      <div style={cardStyle}>
        <p style={{ margin: '0 0 16px 0', fontSize: 15, color: '#4a5580', lineHeight: 1.5 }}>
          Únete a un equipo o crea el tuyo
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onVerEquipos}
            style={{
              padding: '10px 18px',
              borderRadius: 50,
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'Syne', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              background: '#e8eaf0',
              color: '#1428d4',
              boxShadow: '4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff',
            }}
          >
            Ver equipos disponibles
          </button>
          <button
            type="button"
            onClick={onCreateEquipo}
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
            Crear equipo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #1428d4, #0a0f8a)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 2px 2px 5px rgba(255,255,255,0.2)', color: '#fff' }}>
          <IcoUsers />
        </div>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0a0f8a' }}>{nombreEquipo}</h3>
      </div>
      <div style={{ marginBottom: 16 }}>
        <p style={{ margin: '0 0 8px 0', fontSize: 11, fontWeight: 700, color: '#8892b0', textTransform: 'uppercase' }}>Miembros</p>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {miembros.map((m, i) => (
            <li key={i} style={{ marginBottom: 6, fontSize: 13, color: '#0a0f8a' }}>
              {m.nombre} — {m.progreso}%
            </li>
          ))}
        </ul>
      </div>
      <p style={{ margin: '0 0 8px 0', fontSize: 13, color: '#4a5580' }}>
        <strong style={{ color: '#0a0f8a' }}>Puntuación total del equipo:</strong> {puntuacionTotal.toLocaleString('es-MX')} pts
      </p>
      <p style={{ margin: 0, fontSize: 13, color: '#4a5580' }}>
        <strong style={{ color: '#0a0f8a' }}>Próximo reto:</strong> {proximoReto}
      </p>
    </div>
  )
}
