import { NextResponse } from 'next/server'

export interface RetoActivo {
  id: string
  titulo: string
  descripcion: string
  puntos: number
  participantes: number
  totalGrupo: number
  diasRestantes: number
  tipo: 'individual' | 'equipo'
  modulo: string
}

const RETOS_ACTIVOS: RetoActivo[] = [
  {
    id: 'reto-semana-1',
    titulo: 'Documenta una mejora de proceso',
    descripcion: 'Aplica lo aprendido en Módulo 3 en un caso real de tu institución y documenta el resultado.',
    puntos: 150,
    participantes: 24,
    totalGrupo: 32,
    diasRestantes: 3,
    tipo: 'individual',
    modulo: 'Módulo 3 · Ciberseguridad',
  },
  {
    id: 'reto-equipo-1',
    titulo: 'Mapa de riesgos institucional',
    descripcion: 'En equipo, identifiquen y documenten los 5 principales riesgos de ciberseguridad de sus instituciones.',
    puntos: 300,
    participantes: 8,
    totalGrupo: 32,
    diasRestantes: 6,
    tipo: 'equipo',
    modulo: 'Módulo 3 · Ciberseguridad',
  },
]

export async function GET() {
  return NextResponse.json({ retos: RETOS_ACTIVOS })
}
